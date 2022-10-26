import React, { useRef }  from "react";
import useState from "react-usestateref";
import "../styles/WidgetSector.css";
import UploadService from "../services/UploadFilesService";
import BrowsingSector from "./BrowsingSector";
import DataUpload from "./DataUpload";

import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls
} from "react-flow-renderer";


let id = 0;
const getId = (name) => `${name}_${id++}`;
const nodeTypes = { dataUpload: DataUpload };

export default function WidgetSector() {
  const [file, setFile] = useState(false);
  const handleChange = (e) =>{
    const elements = elementsRef.current;
    const sourceElement = elements[elements.length - 1];
    console.log(sourceElement);
    let currentFile = e.target.files[0];
    const img = new Image();
    img.src = URL.createObjectURL(currentFile);
    img.onload = function() {
      alert("The minimum required dimensions are: " + sourceElement.data.onCreation + "\n" +
      "The dimensions of the image are: " + this.width + 'x' + this.height);
      const elementDimensions =  sourceElement.data.onCreation.split("x");
      if(this.width < elementDimensions[0] || this.height < elementDimensions[1]){
        alert("The image is too small");
      }
      else{
        setFile(URL.createObjectURL(currentFile));
        console.log(URL.createObjectURL(currentFile));
        UploadService.uploadGRPC(currentFile);
        sourceElement.data.onCreation = this.width + 'x' + this.height;
      }
    }
  }

  const onDragStart = (event, nodeType, name) => {
    event.dataTransfer.setData("nodeType", nodeType);
    event.dataTransfer.setData("name", name);
    event.dataTransfer.setData("transfer", setFile);
    event.dataTransfer.effectAllowed = "move";
  }

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [elements, setElements, elementsRef] = useState([]);
  const onConnect = (params) => {
    setElements((els) => addEdge(params, els));
    console.log(elementsRef.current);
    console.log(params);
    const sourceElement = elementsRef.current.filter(item => item.id === params.source);
    const targetElement = elementsRef.current.filter(item => item.id === params.target);
    alert("Output dimension: " + sourceElement[0].data.onCreation + "\n" + "Minimum input dimension: " + targetElement[0].data.onCreation);
  };
  const onElementsRemove = (elementsToRemove) =>
    setElements((els) => removeElements(elementsToRemove, els));
  const onLoad = (_reactFlowInstance) =>
    setReactFlowInstance(_reactFlowInstance);
  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData("nodeType");
    const name = event.dataTransfer.getData("name");
    const setFile = event.dataTransfer.getData("setFile");
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    });
    const dimension = type === "dataUpload" ? "800x600" : "640x480";
    const newNode = {
      id: getId(name),
      type,
      position,
      setFile,
      style: {
        background: "#1d4ed8",
        width: 150,
        color: "#fff",
        fontSize: "16px",
        fontFamily: "Helvetica",
        boxShadow: "5px 5px 5px 0px rgba(0,0,0,.10)"
      },
      data: { label: `${name}`, onCreation: dimension, handleChange: handleChange },
      sourcePosition: "right",
      targetPosition: "left"
    };
    setElements((es) => es.concat(newNode));
    if(type === "dataUpload"){
      alert("Minimum required dimensions: " + newNode.data.onCreation);
    }
  };



  return (
    <>
      <div className="flex">
        <div className="w-2/3">
          <div className="groups">
            <div className="grid grid-cols-1 py-10 px-8">
              <div className="">
                  <BrowsingSector file={file}/>  
              </div>    
            </div>   
            <div style={{paddingLeft:"10px"}}>
              <h2 className="text-blue-700 font-semibold"> Data Path </h2>
              <ReactFlowProvider>
                <div
                  style={{ height: "250px", width: "1875px", borderStyle: "solid", borderWidth: "1px", borderColor: "#3b82f6" }}
                  ref={reactFlowWrapper}
                >
                  <ReactFlow
                    elements={elements}
                    onConnect={onConnect}
                    onElementsRemove={onElementsRemove}
                    onLoad={onLoad}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    setFile={setFile}
                  >
                    <Controls />
                  </ReactFlow>
                </div>
              </ReactFlowProvider>
            </div>      
          </div>
        </div>
          <aside style={{paddingTop:"30px"}}>
            <div
              className="item bg-transparent text-blue-700 font-semibold py-2 px-4 border border-blue-500 mt-4 rounded"
              onDragStart={(event) => onDragStart(event, "dataUpload", "DataSource")}
              draggable
            >
              Data Source
            </div>
            <div
              className="item bg-transparent text-blue-700 font-semibold py-2 px-4 border border-blue-500 mt-4 rounded"
              onDragStart={(event) => onDragStart(event, "default", "Recognize")}
              draggable
            >
              Recognize
            </div>
            <div
              className="item bg-transparent text-blue-700 font-semibold py-2 px-4 border border-blue-500 mt-4 rounded"
              onDragStart={(event) => onDragStart(event, "default", "Segment")}
              draggable
            >
              Segment
            </div>
            <div
              className="item bg-transparent text-blue-700 font-semibold py-2 px-4 border border-blue-500 mt-4 rounded"
              onDragStart={(event) => onDragStart(event, "default", "Start")}
              draggable
            >
              Start
            </div>
          </aside>
        </div>
    </>
  );
}
