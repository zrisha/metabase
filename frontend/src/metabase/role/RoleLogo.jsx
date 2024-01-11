import React from "react";
import LogoIcon from "metabase/components/LogoIcon";
import Link from "metabase/components/Link";
import { Flex } from "grid-styled";
import { getDefaultSearchColor } from "metabase/nav/constants";

const RoleLogo = (props) => {  
    return (
      <div className="role-menu" style={{width: "170px"}}>
        <Link
          to="/role/home"
          data-metabase-event={"Navbar;Logo"}
          className="relative cursor-pointer z2 rounded flex justify-center transition-background"
          p={1}
          mx={1}
          hover={{ backgroundColor: getDefaultSearchColor() }}
        >
          <Flex
            style={{ minWidth: 32, height: 32 }}
            align="center"
            justify="center"
            flexDirection="column"
          >
            <div><h3>Data Roles</h3></div>
            <div>Spin-off of <LogoIcon dark height={16} />etabase</div>
          </Flex>
        </Link>
      </div>
    )
  }

  export default RoleLogo