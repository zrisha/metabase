import React from 'react';
import Card from "metabase/components/Card";
import { Absolute } from "metabase/components/Position";
import Icon from "metabase/components/Icon";
import LoadingSpinner from "metabase/components/LoadingSpinner";
import Button from "metabase/core/components/Button";


const RemoveButton = ({deleteNote, noteId}) => (
  <a
    className="text-dark-hover drag-disabled absolute text-medium"
    data-metabase-event="Detective;Remove Note"
    style={{right: "10px"}}
  >
    <Icon name="close" size={16} onClick={(e) => deleteNote(e, noteId)} />
  </a>
);

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
        {props.notes.map(note => (
          <li
            onClick={() => props.setNote(note)}
            className='border-bottom p1 text-ellipsis text-nowrap'>
              <span className='text-brand-hover cursor-pointer'>{getHeader(note.data.value)}</span>
            <RemoveButton deleteNote = {props.deleteNote} noteId={note.id} />
          </li>
        ))}
      </ul> : <div style={{height: "100%"}}className='flex align-center justify-center'><LoadingSpinner /> </div>}
      <div className='bg-white'></div>
      </div>
    </Card>

  )
}

export default NoteSelector