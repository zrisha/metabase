import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import NoteSelector from './NoteSelector';


const initialNote = "<p>Write your findings here</p>"


export default function Notes(props) {
  const [note, setNote] = useState(false);

  const autoSave = useRef(null);
  const isSaving = useRef(null);

  useEffect(() => {
    window.onbeforeunload = function() {
      if(isSaving.current){
        return "";
      }else{
        return null;
      }
    }
  })

  const addNote = () => {
    props.addNote({data: {value: initialNote}, groupId: props.groupId})
  }

  const onEditorChange = (value, editor, autoSave, note) => {
    if(autoSave.current){
      clearTimeout(autoSave.current)
    }

    isSaving.current = true; 

    autoSave.current = setTimeout(() => {
      props.updateNote({noteId: note.id, data:{value}})
      isSaving.current = false
    }, 2500)
  
  }

  const editorRef = useRef(null);

  if(!note){
    return (
      <NoteSelector
        addNote={addNote}
        saving={isSaving.current}
        deleteNote={props.deleteNote}
        setNote={setNote}
        notes={props.notes} />
    )
  }else if (note && note.data){
    return (
    <div style={{height: '100%'}} ref={editorRef} >
      <Editor
        tinymceScriptSrc={'/app/tinymce/tinymce.min.js'}
        onInit={(evt, editor) => editorRef.current = editor}
        onEditorChange={(value, editor) => onEditorChange(value, editor, autoSave, note)}
        initialValue={note.data.value}
        init={{
          height: '100%',
          branding: false,
          menubar: false,
          toolbar: 'backbtn | bold italic forecolor | bullist numlist | removeformat | help ',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
          ],
          setup: function (editor) {

            editor.ui.registry.addButton('backbtn', {
              icon: 'undo',
              onAction: function (_) {
                setNote(false)
              }
            });
          },
          // toolbar: 'undo redo ' +
          //   'bold italic forecolor | fontsize' +
          //   'alignright alignjustify | bullist numlist outdent indent | ' +
          //   'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        }}
      />
    </div>
  );
  }
}