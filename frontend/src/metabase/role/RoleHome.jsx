import React, {useEffect, useMemo} from "react";
import Navbar from "./Navbar";
import { Box, Flex } from "grid-styled";
import Card from "metabase/components/Card";
import Icon from "metabase/components/Icon";
import Link from "metabase/components/Link";
import PageHeading from "metabase/components/type/PageHeading";
import "./RoleHome.css";
import {connect} from "react-redux";
import { setGroup} from "./actions";
import { getUser } from "metabase/selectors/user";
import { push } from "react-router-redux";

import {
  SegmentedControl,
} from "metabase/components/SegmentedControl";

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

const TAB = {
  PLAN: "plan",
  REFLECT: "reflect",
  WORK: "work",
};

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
  const {pathname} = props.location

  const currentTab = useMemo(() => {
    if (/\/plan?/.test(pathname)) {
      return TAB.PLAN;
    }
    if (/\/reflect?/.test(pathname)) {
      return TAB.REFLECT;
    }
    if (/\/work?/.test(pathname)) {
      return TAB.WORK;
    }
    return null;
  }, [pathname]);

  useEffect(() => {
    const groupId = props.user.group_ids.find(id => id != 1 && id !=2);
    //Set group or default to demo
    const currentGroup = groupId ? groupId : 1

    props.setGroup({groupId: currentGroup});
  }, [props.user]);

  return (
    <>
      <Navbar location={props.location} />
      <section className="border-bottom bg-white pb4">
        <PageHeading className="text-centered p2">Select a Role</PageHeading>
        <Flex justifyContent="space-evenly">
          {data.map(props => (
            <RoleCard {...props} />
          ))}
        </Flex>
      </section>
      <section>
        <PageHeading className="text-centered p2">Team Space</PageHeading>
        <Flex justifyContent="center">
          <Box my={2} width={[1, 1/2, 1/2, 1/3]}>
          <SegmentedControl
            fullWidth
            value={currentTab}
            onChange={props.onChangeTab}
            variant="fill-background"
            options={[
              {
                icon: 'lightbulb',
                name: 'Plan',
                value: 'plan'
              },
              {
                icon: 'lineandbar',
                name: 'Reflect',
                value: 'reflect'
              },
              {
                icon: 'insight',
                name: 'View Work',
                value: 'work'
              }
            ]}
          />
          </Box>
        </Flex>
        <div>
          {props.children}
        </div>
      </section>
    </>
  );
}

const mapDispatchToProps = {
  setGroup,
  onChangeTab: tab => push(`/role/home/${tab}`),
}

const mapStateToProps = (state, props) => ({
  home: state.role.home,
  user: getUser(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(RoleHome);

