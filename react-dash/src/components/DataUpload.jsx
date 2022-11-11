import { Handle, Position } from 'react-flow-renderer';
// Different type of wdiget that allows the user to upload a file
function DataUpload({data}) {
  return (
    <div>
      <Handle type="input" position={Position.Right} />
      <div className="text-updater-node">
        <label htmlFor="filePicker" className="picker"> Data Source </label>
        <input id="filePicker" style={{visibility:"hidden", display:"none", position: "absolute"}} type={"file"} onChange={(e) => data.onchange(data.currentElement(), e)} />       
      </div>
      <Handle type="target" position={Position.Left} />
    </div>
    
  );
}

export default DataUpload;