"use client"
import {useEffect, useState} from "react";
import Link from "next/link";
import Image from 'next/image';
import img1 from "./images/Image.svg";

import img2 from "./images/server.gif";
import img3 from "./images/seensor.gif";
import img4 from "./images/client.gif";
import img5 from "./images/bg.svg";

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
        <div className=" container mt-4">
            <div  style={{background: "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,0.35057773109243695) 100%)"}} className="card">

                <div   className="container text-center ">
                    <div  className="row">
                        <div  className="col-sm-6 d-flex justify-content-center align-items-center">
                            <div className="m-5">
                                <h2 style={{color:"#fff"}}>STGen Testbed Launcher over SRTP protocol</h2>
                                <hr style={{color:"#fff"}}/>
                                <h5 style={{color:"#fff"}}>Simulate Testbed</h5>
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
                <div  className="card-body ">
                    <form >
                        <table className="table table-bordered ">
                            <thead className="thead-light ">
                            <tr >
                                <th style={{height:"80px"}} >
                                    <div className="d-flex justify-content-center align-items-center ">
                                    <Image
                                    src={img2}
                                    width={50}
                                    height={50}
                                    alt="Picture of the author"
                                    />
                                    <p  style={{marginTop:"18px "}}>STGEN Core Node Instance Setup</p>
                                    </div>
                                    
                                    
                                </th>

                                <th style={{height:"80px"}} >
                                    <div className="d-flex justify-content-center align-items-center">
                                    <Image
                                    src={img3}
                                    width={50}
                                    height={50}
                                    alt="Picture of the author"
                                    />
                                    <p  style={{marginTop:"18px "}}>Sensor Setup</p>
                                    </div>
                                    
                                    
                                </th>

                                <th style={{height:"80px"}} >
                                    <div className="d-flex justify-content-center align-items-center">
                                    <Image
                                    src={img4}
                                    width={50}
                                    height={50}
                                    alt="Picture of the author"
                                    />
                                    <p  style={{marginTop:"18px "}}>Client Setup</p>
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
                                        <p className="m-1 text-primary-emphasis fw-bold">Instance IP/Port address</p>
                                    </label>
                                    <input
                                        name="serverWithPort"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="ip:port"
                                        value={inputValues.server.serverWithPort}
                                        onChange={(e) => handleInputChange('server', 'serverWithPort', e.target.value)}
                                    />
                                    <hr></hr>
                                    <label>
                                        
                                        <p className="m-1 text-primary-emphasis fw-bold">Client Port</p>
                                    </label>
                                    <input
                                        name="clientPort"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="5005"
                                        value={inputValues.server.clientPort}
                                        onChange={(e) => handleInputChange('server', 'clientPort', e.target.value)}
                                    />
                                    <hr></hr>
                                    <label>
                                        
                                        <p className="m-1 text-primary-emphasis fw-bold">Simulation Time</p>
                                    </label>
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
                                    <label>
                                        
                                        <p className="m-1 text-primary-emphasis fw-bold">STGEN Core Node Instance Address</p>
                                    </label>
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
                                    <label>
                                        
                                        <p className="m-1 text-primary-emphasis fw-bold">Simulation Time</p>
                                   
                                        
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
                                    <hr></hr>
                                    <label>
                                        Number Of Sensors
                                        <p className="m-1 text-primary-emphasis fw-bold">Simulation Time</p>
                                    </label>
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
                                    <label>
                                        
                                        <p className="m-1 text-primary-emphasis fw-bold">STGEN Core Node Instance Address</p>
                                    </label>
                                    <input
                                        name="server"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="ip"
                                        value={inputValues.client.server}
                                        onChange={(e) => handleInputChange('client', 'server', e.target.value)}
                                    />
                                    <hr></hr>
                                    <label>
                                        
                                        <p className="m-1 text-primary-emphasis fw-bold">Client Application Address</p>
                                    </label>
                                    <input
                                        name="clientPort"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Field 2"
                                        value={inputValues.client.clientPort}
                                        onChange={(e) => handleInputChange('client', 'clientPort', e.target.value)}
                                    />
                                    <hr></hr>
                                    <label>
                                        
                                        <p className="m-1 text-primary-emphasis fw-bold">Which sensor are you interested in?</p>
                                    </label>
                                    <input
                                        name="sensors"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="gps_2"
                                        value={inputValues.client.sensors}
                                        onChange={(e) => handleInputChange('client', 'sensors', e.target.value)}
                                    />
                                    <hr></hr>
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
                                    <hr></hr>
                                    <label>
                                       
                                        <p className="m-1 text-primary-emphasis fw-bold"> Observation Time</p>
                                    </label>
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
