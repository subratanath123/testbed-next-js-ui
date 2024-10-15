"use client"
import {useEffect, useState} from "react";
import Link from "next/link";

export default function Home() {
    const [showDownloadLink, setShowDownloadLink] = useState(
        false
    );

    interface InputValues {
        serverWithPort?: string;
        clientPort?: string;
        numberOfSensors?: string;
        simulationTime?: string;
        observationTime?: string;
        server?: string;
        clientLogName?: string;
        sensors?: string;
    }

    interface TextAreas {
        sensor: string;
        server: string;
        client: string;
    }

    // Create state for input fields and text areas
    const [inputValues, setInputValues] = useState<{
        sensor: InputValues;
        server: InputValues;
        client: InputValues;
    }>({
        sensor: { serverWithPort: 'localhost:5004', simulationTime: '20', numberOfSensors: '4' },
        server: { serverWithPort: 'localhost:5004', clientPort: '5005', simulationTime: '20' },
        client: { server: 'localhost:5004', clientLogName: 'client1_sensor_log', sensors: 'gps_2', clientPort: 'localhost:5005', observationTime: '20' },
    });

    const [textAreas, setTextAreas] = useState<TextAreas>({
        sensor: '',
        server: '',
        client: ''
    });

    // Separate SSE EventSources for each API
    const [sensorEventSource, setSensorEventSource] = useState<EventSource | null>(null);
    const [serverEventSource, setServerEventSource] = useState<EventSource | null>(null);
    const [clientEventSource, setClientEventSource] = useState<EventSource | null>(null);

    // Handler to update input field values
    const handleInputChange = (column: keyof typeof inputValues, field: keyof InputValues, value: string) => {
        setInputValues((prev) => ({
            ...prev,
            [column]: { ...prev[column], [field]: value },
        }));
    };

    // Function to connect to SSE
    const connectToSSE = (column: keyof typeof inputValues, setEventSource: React.Dispatch<React.SetStateAction<EventSource | null>>) => {
        const queryParams = new URLSearchParams({
            serverWithPort: inputValues[column].serverWithPort || '',
            clientPort: inputValues[column].clientPort || '',
            numberOfSensors: inputValues[column].numberOfSensors || '',
            simulationTime: inputValues[column].simulationTime || '',
            observationTime: inputValues[column].observationTime || '',
            server: inputValues[column].server || '',
            clientLogName: inputValues[column].clientLogName || '',
            sensors: inputValues[column].sensors || '',
        }).toString();

        // Build the URL with query parameters
        const newEventSource = new EventSource(`http://localhost:8080/trigger/${column}?${queryParams}`);

        // Clear the textarea when starting new SSE connection
        setTextAreas((prev) => ({
            ...prev,
            [column]: ''
        }));

        // Listen for events and append to textarea
        newEventSource.onmessage = (event) => {
            setTextAreas((prev) => ({
                ...prev,
                [column]: prev[column] + '\n' + event.data,  // Append new data to the existing textarea content
            }));
        };

        newEventSource.onerror = () => {
            console.error('Error in SSE connection');
            newEventSource.close();
        };

        setShowDownloadLink(true);

        // Save the EventSource object so it can be closed later
        setEventSource(newEventSource);
    };

    // Handler to connect to SSE for Sensor
    const handleSensorClick = () => {
        if (sensorEventSource) {
            sensorEventSource.close();
        }
        connectToSSE('sensor', setSensorEventSource);
    };

    // Handler to connect to SSE for Server
    const handleServerClick = () => {
        if (serverEventSource) {
            serverEventSource.close();
        }
        connectToSSE('server', setServerEventSource);
    };

    // Handler to connect to SSE for Client
    const handleClientClick = () => {
        if (clientEventSource) {
            clientEventSource.close();
        }
        connectToSSE('client', setClientEventSource);
    };

    // Close SSE connections when component unmounts
    useEffect(() => {
        return () => {

        };
    }, [sensorEventSource, serverEventSource, clientEventSource]);

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header">
                    <h2>Setup Configuration</h2>
                    <h5>Simulate Testbed</h5>
                </div>
                <div className="card-body">
                    <form>
                        <table className="table table-bordered">
                            <thead className="thead-light">
                            <tr>
                                <th>STGEN Core Node Instance Setup</th>
                                <th>Sensor Setup</th>
                                <th>Client Setup</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>

                                <td>
                                    <label>Instance IP/Port address</label>
                                    <input
                                        name="serverWithPort"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="ip:port"
                                        value={inputValues.server.serverWithPort}
                                        onChange={(e) => handleInputChange('server', 'serverWithPort', e.target.value)}
                                    />
                                    <hr></hr>
                                    <label>Client Port</label>
                                    <input
                                        name="clientPort"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="5005"
                                        value={inputValues.server.clientPort}
                                        onChange={(e) => handleInputChange('server', 'clientPort', e.target.value)}
                                    />
                                    <hr></hr>
                                    <label>Simulation Time</label>
                                    <input
                                        name="simulationTime"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="10"
                                        value={inputValues.server.simulationTime}
                                        onChange={(e) => handleInputChange('server', 'simulationTime', e.target.value)}
                                    />
                                    <button type="button" className="btn btn-primary"
                                            onClick={() => handleServerClick()}>
                                        Run Server
                                    </button>
                                </td>
                                <td>
                                    <label>STGEN Core Node Instance Address</label>
                                    <input
                                        name="serverWithPort"
                                        required={true}
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="ip:port"
                                        value={inputValues.sensor.serverWithPort}
                                        onChange={(e) => handleInputChange('sensor', 'serverWithPort', e.target.value)}
                                    />
                                    <hr></hr>
                                    <label>Simulation Time</label>
                                    <input
                                        name="simulationTime"
                                        required={true}
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="10"
                                        value={inputValues.sensor.simulationTime}
                                        onChange={(e) => handleInputChange('sensor', 'simulationTime', e.target.value)}
                                    />
                                    <hr></hr>
                                    <label>Number Of Sensors</label>
                                    <input
                                        name="numberOfSensors"
                                        type="text"
                                        required={true}
                                        className="form-control mb-2"
                                        placeholder="4"
                                        value={inputValues.sensor.numberOfSensors}
                                        onChange={(e) => handleInputChange('sensor', 'numberOfSensors', e.target.value)}
                                    />
                                    <button type="button" className="btn btn-primary"
                                            onClick={() => handleSensorClick()}>
                                        Run Sensors
                                    </button>
                                </td>

                                <td>
                                    <label>STGEN Core Node Instance Address</label>
                                    <input
                                        name="server"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="ip"
                                        value={inputValues.client.server}
                                        onChange={(e) => handleInputChange('client', 'server', e.target.value)}
                                    />
                                    <hr></hr>
                                    <label>Client Application Address</label>
                                    <input
                                        name="clientPort"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Field 2"
                                        value={inputValues.client.clientPort}
                                        onChange={(e) => handleInputChange('client', 'clientPort', e.target.value)}
                                    />
                                    <hr></hr>
                                    <label>Which sensor are you interested in?</label>
                                    <input
                                        name="sensors"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="gps_2"
                                        value={inputValues.client.sensors}
                                        onChange={(e) => handleInputChange('client', 'sensors', e.target.value)}
                                    />
                                    <hr></hr>
                                    <label>Archive directory Name</label>
                                    <input
                                        name="clientLogName"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="client1_sensor_log"
                                        value={inputValues.client.clientLogName}
                                        onChange={(e) => handleInputChange('client', 'clientLogName', e.target.value)}
                                    />
                                    <hr></hr>
                                    <label>Observation Time</label>
                                    <input
                                        name="observationTime"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="20"
                                        value={inputValues.client.observationTime}
                                        onChange={(e) => handleInputChange('client', 'observationTime', e.target.value)}
                                    />
                                    <button type="button" className="btn btn-primary"
                                            onClick={() => handleClientClick()}>
                                        Run Client
                                    </button>
                                    <br></br>
                                    <br></br>
                                    {
                                       showDownloadLink && <Link style={{backgroundColor:"green", color:"whitesmoke"}} href={`http://localhost:8080/download?logDirectory=${inputValues.client.clientLogName}`}>Download Received Data</Link>
                                    }


                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label><b>STGEN Core Node Instance Logs</b></label>
                                    <textarea  className="form-control" value={textAreas.server} readOnly
                                              rows={20}></textarea>
                                </td>
                                <td>
                                    <label><b>Sensor application Logs</b></label>
                                    <textarea className="form-control" value={textAreas.sensor} readOnly
                                              rows={20}></textarea>
                                </td>
                                <td>
                                    <label><b>Client application Logs</b></label>
                                    <textarea className="form-control" value={textAreas.client} readOnly
                                              rows={20}></textarea>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </form>
                </div>
            </div>
        </div>
    );
}
