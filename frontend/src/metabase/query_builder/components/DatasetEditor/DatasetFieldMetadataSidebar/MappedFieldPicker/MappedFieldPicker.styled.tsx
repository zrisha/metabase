import styled, { css } from "styled-components";
import { color } from "metabase/lib/colors";
import SelectButton from "metabase/components/SelectButton";
import { forwardRefToInnerRef } from "metabase/styled-components/utils";

export const StyledSelectButton = forwardRefToInnerRef(styled(SelectButton)`
  width: 100%;

  ${props =>
    props.hasValue &&
    css`
      color: ${color("text-white")} !important;
      background-color: ${color("brand")};
      border-color: ${color("brand")};
      .Icon {
        color: ${color("text-white")};
      }
    `};
`);
