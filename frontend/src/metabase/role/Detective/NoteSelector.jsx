import React from 'react';
import Card from "metabase/components/Card";
import { Absolute } from "metabase/components/Position";
import Icon from "metabase/components/Icon";
import LoadingSpinner from "metabase/components/LoadingSpinner";
import Button from "metabase/core/components/Button";
import Confirm from "metabase/components/Confirm";


const RemoveButton = ({deleteNote, noteId, noteHeader, groupId}) => {
  return (
    <span onClick={(e) => e.stopPropagation()}>
    <Confirm
      action={() => deleteNote({noteId, groupId})}
      title={`Permanently Delete Note?`}
      content={<div><h4>You will not be able to recover the note!</h4><p><strong>Note preview:</strong> {noteHeader} (. . .)</p></div>}
    >
        <span
          className="text-dark-hover drag-disabled absolute text-medium"
          data-metabase-event="Detective;Remove Note"
          style={{right: "10px"}}
          // onClick={e => onClick(e)}
        >
          <Icon name="close" size={16} />
        </span>
    </Confirm>
    </span>
  )
};

const getHeader = (value) => {
  var div = document.createElement("div");
  div.innerHTML = value

  if(!div.innerText){
    return strInputCode.replace(/<\/?[^>]+(>|$)/g, "");
  }else{
    return div.innerText
  }
}

const NoteSelector = (props) => {
  return (
    <Card style={{height:"100%", overflowY: 'auto'}} className='bg-brand relative flex flex-column'>
      <Absolute top={5} right={5} data-metabase-event="Detective;Add Note" className="text-white-hover cursor-pointer">
        <Button onlyIcon icon="add" disabled={props.saving} onClick={props.addNote}/>
      </Absolute>
      <h4 className='text-centered my1 text-white'>Notes</h4>
      <div style={{flex: 1}}  className='bg-white'>
      {!props.saving ? <ul className='note-list'>
        {props.notes.map((note, i) => (
          <li
            onClick={() => props.setNote(note)}
            key={i}
            className='border-bottom p1 text-ellipsis text-nowrap'>
              <span className='text-brand-hover cursor-pointer'>{getHeader(note.data.value)}</span>
            <RemoveButton noteHeader={getHeader(note.data.value).substring(0,150)} deleteNote = {props.deleteNote} noteId={note.id} groupId={props.groupId}/>
          </li>
        ))}
      </ul> : <div style={{height: "100%"}}className='flex align-center justify-center'><LoadingSpinner /> </div>}
      <div className='bg-white'></div>
      </div>
    </Card>

  )
}

export default NoteSelector