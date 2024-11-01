"use client"
import {useEffect, useState} from "react";
import Link from "next/link";
import Image from 'next/image';
import img1 from "./images/Image.svg";

import img2 from "./images/server.gif";
import img3 from "./images/seensor.gif";
import img4 from "./images/client.gif";

export default function Home() {
    const [showDownloadLink, setShowDownloadLink] = useState(
        false
    );

    interface InputValues {
        serverWithPort?: string;
        sensorCommunicationPort?: string;
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

    const sensorMap = {
        "gps": "GPS",
        "camera": "Camera",
        "temp": "Temperature",
        "device": "Device",
    };

    const sensorDefaultGenerationIntervalMap = {
        "gps": 1,
        "camera": 1,
        "temp": 1,
        "device": 2,
    };

    type SensorKeys = keyof typeof sensorMap

    interface SensorConfigFields {
        sensorType: SensorKeys;
        numberOfNodes: number;
        emissionRate: number;
        override: boolean;
    }

    interface SensorInterestField {
        sensorName: string;
    }

    const [sensorConfigFields, setSensorConfigFields] = useState<SensorConfigFields[]>([]);
    const [sensorFields, setSensorFields] = useState<SensorInterestField[]>([]);


    const handleAddMoreSensors = () => {
        setSensorConfigFields((prevInputs) => [
            ...prevInputs,
            {sensorType: 'gps', numberOfNodes: 4, emissionRate: sensorDefaultGenerationIntervalMap.gps, override: true}
        ]);
    };

    const handleSesnsorInputChange = (index: number, field: keyof SensorConfigFields, value: string | boolean) => {
        const newInputs = [...sensorConfigFields];
        // Use type assertion to ensure TypeScript knows newInputs[index] is SensorConfigFields
        newInputs[index] = {
            ...newInputs[index],
            [field]: value
        };

        if (field == 'sensorType') {
            newInputs[index] = {
                ...newInputs[index],
                emissionRate: sensorDefaultGenerationIntervalMap[value]
            };
        }

        if (field == 'override') {
            newInputs[index] = {
                ...newInputs[index],
                override: !value
            };
        }


        setSensorConfigFields(newInputs);
    };

    const handleAddSensorInterests = () => {
        setSensorFields((prevInputs) => [
            ...prevInputs,
            {sensorName: 'gps_1'}
        ]);
    };

    const handleSesnsorInterestChange = (index: number, field: keyof SensorInterestField, value: string) => {
        const newInputs = [...sensorFields];
        // Use type assertion to ensure TypeScript knows newInputs[index] is SensorConfigFields
        newInputs[index] = {
            ...newInputs[index],
            [field]: value
        };
        setSensorFields(newInputs);
    };


    // Create state for input fields and text areas
    const [inputValues, setInputValues] = useState<{
        sensor: InputValues;
        server: InputValues;
        client: InputValues;
    }>({
        sensor: {sensorCommunicationPort: 'localhost:5004', simulationTime: '20', numberOfSensors: '4'},
        server: {
            serverWithPort: 'localhost:5005',
            simulationTime: '20',
            sensorCommunicationPort: "localhost:5004"
        },
        client: {
            serverWithPort: 'localhost:5005',
            clientLogName: 'client1_sensor_log',
            observationTime: '20'
        },
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
            [column]: {...prev[column], [field]: value},
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
            sensorCommunicationPort: inputValues[column].sensorCommunicationPort || '',
            server: inputValues[column].server || '',
            clientLogName: inputValues[column].clientLogName || '',
            sensors: inputValues[column].sensors || '',
            sensorConfig: column === "sensor" ? sensorConfigFields.map((config) => `${config.sensorType}:${config.numberOfNodes}:${config.override && config.sensorType != "device" ? config.emissionRate : 0}`).join(' ') : '',
            sensorList: column === "client" ? sensorFields.map((config) => `-r${config.sensorName}`).join(' ') : '',
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
        <div className=" container mt-4">
            <div
                style={{background: "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,0.35057773109243695) 100%)"}}
                className="card">

                <div className="container text-center ">
                    <div className="row">
                        <div className="col-sm-6 d-flex justify-content-center align-items-center">
                            <div className="m-5">
                                <h2 style={{fontWeight: "900"}}>STGen Traffic Analyzer Application</h2>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <Image
                                src={img1}
                                width={300}
                                height={300}
                                alt="Picture of the author"
                            />
                            {/* <img width="500px"
                        height="500px"  src="./images/image.svg" alt="" /> */}
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    <form>
                        <table className="table table-bordered ">
                            <thead className="thead-light ">
                            <tr>
                                <th style={{height: "80px"}}>
                                    <div className="d-flex justify-content-center align-items-center ">
                                        <Image
                                            src={img2}
                                            width={50}
                                            height={50}
                                            alt="Picture of the author"
                                        />
                                        <p style={{marginTop: "18px "}}>STGen Core Node Instance Setup</p>
                                    </div>


                                </th>

                                <th style={{height: "80px"}}>
                                    <div className="d-flex justify-content-center align-items-center">
                                        <Image
                                            src={img3}
                                            width={50}
                                            height={50}
                                            alt="Picture of the author"
                                        />
                                        <p style={{marginTop: "18px "}}>Sensor Setup</p>
                                    </div>

                                </th>

                                <th style={{height: "80px"}}>
                                    <div className="d-flex justify-content-center align-items-center">
                                        <Image
                                            src={img4}
                                            width={50}
                                            height={50}
                                            alt="Picture of the author"
                                        />
                                        <p style={{marginTop: "18px "}}>Client Setup</p>
                                    </div>


                                </th>

                                {/* <th style={{height:"80px" }} className="d-flex justify-content-center align-items-center">
                                    <Image
                                    src={img2}
                                    width={50}
                                    height={50}
                                    alt="Picture of the author"
                                    />
                                    
                                    
                                </th> */}

                                {/* <th style={{height:"80px "}} className="d-flex justify-content-center align-items-center">
                                    <Image
                                    src={img2}
                                    width={50}
                                    height={50}
                                    alt="Picture of the author"
                                    />
                                    <p style={{marginTop:"18px "}}>Client Setup</p>
                                    
                                </th> */}
                            </tr>
                            </thead>
                            <tbody>
                            <tr>

                                <td>
                                    <label>
                                        <p className="m-1 text-primary-emphasis fw-bold">Client Communication
                                            address</p>
                                    </label>
                                    <input
                                        name="serverWithPort"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="ip:port"
                                        value={inputValues.server.serverWithPort}
                                        onChange={(e) => handleInputChange('server', 'serverWithPort', e.target.value)}
                                    />
                                    <label>
                                        <p className="m-1 text-primary-emphasis fw-bold">Sensor Communication
                                            address</p>
                                    </label>
                                    <input
                                        name="sensorPort"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="5004"
                                        value={inputValues.server.sensorCommunicationPort}
                                        onChange={(e) => handleInputChange('server', 'sensorCommunicationPort', e.target.value)}
                                    />

                                    <label>
                                        <p className="m-1 text-primary-emphasis fw-bold">Simulation Time (Seconds)</p>
                                    </label>
                                    <input
                                        name="simulationTime"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="10"
                                        value={inputValues.server.simulationTime}
                                        onChange={(e) => handleInputChange('server', 'simulationTime', e.target.value)}
                                    />
                                    <br></br>
                                    <br></br>
                                    <div className="d-flex justify-content-center">
                                        <button type="button" className="btn btn-outline-primary"
                                                onClick={() => handleServerClick()}>
                                            Run Server
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <label>
                                        <p className="m-1 text-primary-emphasis fw-bold">Sensor to Core Communication
                                            Address</p>
                                    </label>

                                    <input
                                        name="sensorCommunicationPort"
                                        required={true}
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="ip:port"
                                        value={inputValues.sensor.sensorCommunicationPort}
                                        onChange={(e) => handleInputChange('sensor', 'sensorCommunicationPort', e.target.value)}
                                    />
                                    {/*<hr></hr>*/}

                                    <label>

                                        <p className="m-1 text-primary-emphasis fw-bold">Simulation Time (Seconds)</p>


                                    </label>
                                    <input
                                        name="simulationTime"
                                        required={true}
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="10"
                                        value={inputValues.sensor.simulationTime}
                                        onChange={(e) => handleInputChange('sensor', 'simulationTime', e.target.value)}
                                    />
                                    {/*<hr></hr>*/}


                                    <hr></hr>
                                    <div className="d-flex justify-content-center">
                                        <label>
                                            <p className="m-1 text-primary-emphasis fw-bold">Configure Nodes</p>
                                        </label>
                                    </div>
                                    <hr></hr>

                                    <table className="table">
                                        <thead>
                                        <tr>
                                            <th style={{width: "100px"}}>Sensor</th>
                                            <th style={{width: "120px"}}>Number of Nodes</th>
                                            <th style={{width: "150px"}}>Override Default Interval</th>
                                            <th style={{width: "80px"}}></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {sensorConfigFields.map((input, index) => (
                                            <tr key={index}>
                                                <td width="140px">
                                                    <select
                                                        name="sensorType"
                                                        required
                                                        className="form-control"
                                                        style={{width: "100%"}}
                                                        value={input.sensorType}
                                                        onChange={(e) => handleSesnsorInputChange(index, 'sensorType', e.target.value)}
                                                    >
                                                        <option value="gps">GPS</option>
                                                        <option value="camera">Camera</option>
                                                        <option value="device">Device</option>
                                                        <option value="temp">Temperature</option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <input
                                                        name="numberOfNodes"
                                                        type="text"
                                                        required
                                                        className="form-control"
                                                        style={{width: "100%"}}
                                                        value={input.numberOfNodes}
                                                        placeholder="4"
                                                        onChange={(e) => handleSesnsorInputChange(index, 'numberOfNodes', e.target.value)}
                                                    />
                                                </td>

                                                <td>
                                                    <div className="text-center form-check form-switch">
                                                        {
                                                            input.sensorType != "device" &&
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                checked={input.override}
                                                                id={`flexCheckDefault-${index}`}
                                                                onChange={() => handleSesnsorInputChange(index, 'override', input.override)}
                                                            />
                                                        }
                                                    </div>
                                                </td>

                                                <td>
                                                    {input.override && input.sensorType != "device" && (
                                                        <div style={{display: "flex", alignItems: "center"}}>
                                                            <input
                                                                name="emissionRate"
                                                                type="text"
                                                                required
                                                                className="form-control"
                                                                style={{width: "70px", marginRight: "5px"}}
                                                                value={input.emissionRate}
                                                                placeholder="0"
                                                                onChange={(e) => handleSesnsorInputChange(index, 'emissionRate', e.target.value)}
                                                            />
                                                            <span>Second(s)</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    <br></br>
                                    <div className="d-flex justify-content-end">
                                        <button type="button" className="btn btn-secondary btn-sm"
                                                onClick={handleAddMoreSensors}>
                                            + Configure New Sensor
                                        </button>
                                    </div>
                                    <hr></hr>
                                    <br></br>
                                    <br></br>
                                    <div className="d-flex justify-content-center">
                                        <button type="button" className="btn btn-outline-primary"
                                                onClick={() => handleSensorClick()}>
                                            Run Sensors
                                        </button>
                                    </div>
                                </td>

                                <td>
                                    <label>

                                        <p className="m-1 text-primary-emphasis fw-bold">Client to Core Communication
                                            Address</p>
                                    </label>
                                    <input
                                        name="serverWithPort"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="ip"
                                        value={inputValues.client.serverWithPort}
                                        onChange={(e) => handleInputChange('client', 'serverWithPort', e.target.value)}
                                    />

                                    <label>

                                        <p className="m-1 text-primary-emphasis fw-bold">Archive directory Name</p>
                                    </label>
                                    <input
                                        name="clientLogName"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="client1_sensor_log"
                                        value={inputValues.client.clientLogName}
                                        onChange={(e) => handleInputChange('client', 'clientLogName', e.target.value)}
                                    />
                                    {/*<hr></hr>*/}

                                    <label>

                                        <p className="m-1 text-primary-emphasis fw-bold"> Observation Time (Seconds)</p>
                                    </label>
                                    <input
                                        name="observationTime"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="20"
                                        value={inputValues.client.observationTime}
                                        onChange={(e) => handleInputChange('client', 'observationTime', e.target.value)}
                                    />
                                    {/*<hr></hr>*/}

                                    <hr></hr>
                                    <label>
                                        <p className="m-1 text-primary-emphasis fw-bold">Which sensor are you interested
                                            in?</p>
                                    </label>
                                    {sensorFields.map((input, index) => (
                                        <div key={index} className="d-flex align-items-center">

                                            <input
                                                name="sensorName"
                                                type="text"
                                                className="form-control mb-2"
                                                placeholder="120"
                                                value={input.sensorName}
                                                onChange={(e) => handleSesnsorInterestChange(index, 'sensorName', e.target.value)}
                                            />
                                        </div>
                                    ))}
                                    <div className="d-flex justify-content-end">
                                        <button type="button" className="btn btn-secondary btn-sm"
                                                onClick={handleAddSensorInterests}>
                                            + Add More
                                        </button>
                                    </div>
                                    <hr></hr>
                                    <br></br>
                                    <br></br>
                                    <div className="d-flex justify-content-center">
                                        <button type="button" className="btn btn-outline-primary"
                                                onClick={() => handleClientClick()}>
                                            Run Client
                                        </button>
                                    </div>
                                    {
                                        showDownloadLink &&
                                        <Link style={{backgroundColor: "green", color: "whitesmoke"}}
                                              href={`http://localhost:8080/download?logDirectory=${inputValues.client.clientLogName}`}>Download
                                            Received Data</Link>
                                    }


                                </td>
                            </tr>

                            <tr>

                                <td>
                                    <div>
                                        <label><b>STGen Core Node Instance Logs</b></label>
                                        <textarea className="form-control" value={textAreas.server} readOnly
                                                  rows={20}></textarea>
                                    </div>
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
