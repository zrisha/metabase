import React, {useEffect} from "react";
import Navbar from "./Navbar";
import { Box, Flex } from "grid-styled";
import Card from "metabase/components/Card";
import Icon from "metabase/components/Icon";
import Link from "metabase/components/Link";
import "./RoleHome.css";
import {connect} from "react-redux";
import CollapseSection from "metabase/components/CollapseSection";
import { getDocId} from "./actions";
import { getUser } from "metabase/selectors/user";

const data = [
  {
    role: "Journalist",
    slug: "journalist",
    icon: "pencil",
  },
  {
    role: "Detective",
    slug: "detective",
    icon: "search",
  },
  {
    role: "Artist",
    slug: "artist",
    icon: "palette",
  },
];

const RoleCard = props => {
  return (
    <Box p={1} width={[1 / 3, 1 / 4]}>
      <Link to={`/role/${props.slug}/do`}>
        <Card
          p={2}
          hoverable
          className="bg-white text-brand-hover rounded bordered role-card flex align-center"
        >
          <div className="bg-brand-light rounded mx1">
            <Icon size={24} name={props.icon} />
          </div>
          <h3 className="inline mx1">{props.role}</h3>
        </Card>
      </Link>
    </Box>
  );
};

function RoleHome(props) {

  const {getDocId} = props

  useEffect(() => {
    const groupId = props.user.group_ids.find(id => id != 1 && id !=2);
    getDocId({groupId});
  }, [getDocId]);

  return (
    <>
      <Navbar location={props.location} />
      <section>
        <h1 className="text-centered p2">Select a Role</h1>
        <Flex justifyContent="space-evenly">
          {data.map(props => (
            <RoleCard {...props} />
          ))}
        </Flex>

        <CollapseSection
          header={<h2>See everyone's work</h2>}
          initialState="collapsed"
          headerClass="work-header"
        >
          <div className="flex justify-center my3 role-doc align-center">
            <div className="relative">
            <div className='blocker'></div>
            {props.home.docId && <iframe
              className="bordered"
              src={`https://docs.google.com/document/d/${props.home.docId}/edit`}
              frameborder="0"
              width="90%"
              height="700"
              allowfullscreen="true"
              mozallowfullscreen="true"
              webkitallowfullscreen="true"
            ></iframe>}
            </div>
          </div>
        </CollapseSection>
      </section>
    </>
  );
}

const mapDispatchToProps = {
  getDocId
}

const mapStateToProps = (state, props) => ({
  home: state.role.home,
  user: getUser(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(RoleHome);

