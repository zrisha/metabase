import React from 'react';
import Card from "metabase/components/Card";
import { Absolute } from "metabase/components/Position";
import Icon from "metabase/components/Icon";
import Button from "metabase/core/components/Button";
import DateTime from "metabase/components/DateTime";
import Confirm from "metabase/components/Confirm";


const RemoveButton = ({deleteArt, artId}) => {
  return (
    <span onClick={(e) => e.stopPropagation()}>
    <Confirm
      action={() => deleteArt({artId})}
      title={`Permanently Delete Artwork #${artId}?`}
      content={<h4>You will not be able to recover the artwork!</h4>}
    >
        <span
          className="text-dark-hover drag-disabled absolute text-medium"
          data-metabase-event="Artist;Remove Art"
          style={{right: "10px"}}
        >
          <Icon name="close" size={16} />
        </span>
    </Confirm>
    </span>
  )
};

const SavedArt = (props) => {
  return (
    <Card style={{height:"100%", overflowY: 'auto'}} className='bg-brand relative flex flex-column'>
      <Absolute top={5} right={5} data-metabase-event="Artist;Add Art" className="text-white-hover cursor-pointer">
        <Button onlyIcon icon="add" disabled={false} onClick={() => props.addArt({data: {}, groupId: props.groupId})}/>
      </Absolute>
      <h4 className='text-centered my1 text-white'>Arts</h4>
      <div style={{flex: 1}}  className='bg-white'>
      <ul className='art-list'>
        {props.arts && props.arts.map((art, index) => art.id == props.selectedArt.id ? 
        (
          <li
            key={art.id}
            className='border-bottom p1 text-ellipsis text-nowrap bg-brand-light'>
              <span className='text-bold'>#{index + 1}: <DateTime value={new Date(art.created_at)}/></span>
          </li>
        )
        : (
          <li
            key={art.id}
            onClick={() => props.selectArt({selectedArt: {id: art.id}})}
            className='border-bottom p1 text-ellipsis text-nowrap'>
              <span className='text-brand-hover cursor-pointer'>#{index + 1}: <DateTime value={new Date(art.created_at)}/></span>
            <RemoveButton deleteArt={props.deleteArt} artId={art.id} />
          </li>
        ) 
        )}
      </ul>
      <div className='bg-white'></div>
      </div>
    </Card>
  )
}

export default SavedArt;