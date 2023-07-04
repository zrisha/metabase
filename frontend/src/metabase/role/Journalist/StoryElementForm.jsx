import React, { useState } from "react";
import { Absolute } from "metabase/components/Position";
import "./StoryElements.css";
import Icon from "metabase/components/Icon";
import validate from "metabase/lib/validate";
import Form, {
  FormField,
  FormSubmit,
} from "metabase/containers/Form";
import AutosizeTextarea from "react-textarea-autosize";
import { formDomOnlyProps } from "metabase/lib/redux";
import Button from "metabase/core/components/Button";

const handleSubmit = ({values, props, exists}) => {
  if(exists){
    props.updateStoryElement({data: {...props.selectedElement.data, ...values}, storyId: props.selectedElement.storyId})
  }else{
    props.addStoryElement({data: values, type: props.selectedElement.type, group_id: props.group});
  }
}

function StoryElementForm(props) {
  const exists = props.selectedElement && 'storyId' in props.selectedElement;

  const onExit = () => {
    props.selectStoryElement({selectedElement: null});
  }

  const onDelete = () => {
    if(exists)
      props.deleteStoryElement({storyId: props.selectedElement.storyId})
  }

  if(!props.selectedElement || !props.selectedElement.type)
    return <></>

  return <>
        <div className="text-left p1 story-element-detail relative">
        <Absolute top={5} right={5}>
          <Icon name="close" className="text-light text-medium-hover cursor-pointer" onClick = {onExit}/>
        </Absolute>
        <h3>{props.selectedElement.name}</h3>
        {props.selectedElement.description.map(ele => {
          if(Array.isArray(ele)){
            return <ul>
              {ele.map(li => <li>{li}</li>)}
            </ul>
          }else{
            return ele
          }
        })}
        <br />
        {props.selectedElement.example && <h4>Example</h4>}
        {props.selectedElement.example}
        </div>

        <Form className="story-element-form" formName={props.selectedElement.type} initialValues={props.selectedElement.data} onSubmit={(values) => handleSubmit({values, props, exists})}>
        <FormField name="user_title"   title="Title" info="A brief description for displaying" placeholder="Enter title to display" validate={validate.required()} />
        {props.selectedElement.fields.map((ele) => {
            if(ele.type == "textarea"){
              return (
                <FormField 
                  name={ele.name} 
                  title={ele.title} 
                  info={ele.info ? ele.info : false}
                  type={({ field }) => <AutosizeTextarea 
                                        minRows={2} maxRows={4} 
                                        placeholder={ele.placeholder} 
                                        className="role-textarea" {...formDomOnlyProps(field)} />}
                />)
            } else {
              return (
                <FormField name={ele.name}   title={ele.title}  placeholder={ele.placeholder}  validate={validate.required()} />
              )
            }
          })}
          <div className="pb2">
            {exists ? <FormSubmit >Update Element</FormSubmit> : <FormSubmit >Add Element</FormSubmit>}
            {<Button type="button" className="mx1" onClick = {onExit} >Cancel</Button>}
            {exists && <Button type="button" warning className="mx1" onClick = {onDelete} >Delete</Button>}
          </div>
        </Form>
    </>
}

export default StoryElementForm;
