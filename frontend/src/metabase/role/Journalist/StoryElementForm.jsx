import React from "react";
import { Absolute } from "metabase/components/Position";
import Icon from "metabase/components/Icon";
import validate from "metabase/lib/validate";
import Form, {
  FormField,
  FormSubmit,
} from "metabase/containers/Form";
import AutosizeTextarea from "react-textarea-autosize";
import { formDomOnlyProps } from "metabase/lib/redux";
import Button from "metabase/core/components/Button";
import Card from 'metabase/components/Card';
import CollapseSection from "metabase/components/CollapseSection";
import Confirm from "metabase/components/Confirm";

const handleSubmit = ({values, props, exists}) => {
  if(exists){
    props.updateStoryElement({data: {...props.selectedElement.data, ...values}, storyId: props.selectedElement.storyId, groupId: props.group})
  }else{
    props.addStoryElement({data: values, type: props.selectedElement.type, groupId: props.group});
  }
}

const DeleteButton = ({onDelete}) => {
  return (
    <Confirm
      action={onDelete}
      title={`Permanently Delete Story Element?`}
      content={<h4>You will not be able to recover the story element!</h4>}
    >
      <Button type="button" warning className="mx1" >Delete</Button>
    </Confirm>
  )
}

function StoryElementForm(props) {
  const exists = props.selectedElement && 'storyId' in props.selectedElement;

  const onExit = () => {
    props.clearStoryElement();
  }

  const onDelete = () => {
    if(exists){
      props.deleteStoryElement({storyId: props.selectedElement.storyId, groupId: props.group})
    }
  }

  if(!props.selectedElement || !props.selectedElement.type)
    return <></>
  
  return <Card className='story-form-wrapper'>
        <div className="text-left p1 story-element-detail relative">
          <Absolute top={5} right={5}>
            <Icon name="close" className="text-light text-medium-hover cursor-pointer" onClick = {onExit}/>
          </Absolute>
          <h3>{props.selectedElement.name}</h3>
          {props.selectedElement.definition}
          <CollapseSection headerClass="text-brand text-bold text-underline-hover" header="See an example">
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
          </CollapseSection>
        </div>

        <Form 
          className="story-element-form" 
          overwriteOnInitialValuesChange={true}
          formName={props.selectedElement.type} 
          initialValues={props.selectedElement.data ? props.selectedElement.data : false} 
          onSubmit={(values) => handleSubmit({values, props, exists})} >
        <FormField 
          name="user_title" 
          title="Headline" 
          info="A brief description displayed on your story map. 55 letters max" 
          placeholder="Enter title to display" 
          validate={validate.required().maxLength(55)} />
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
            {exists && <DeleteButton onDelete = {onDelete} >Delete</DeleteButton>}
          </div>
        </Form>
    </Card>
}

export default StoryElementForm;
