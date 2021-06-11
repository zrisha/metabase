import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { TreeNodeList } from "./TreeNodeList";
import { TreeNode } from "./TreeNode";

const propTypes = {
  TreeNodeComponent: PropTypes.object,
  data: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  emptyState: PropTypes.node,
};

export function Tree({
  TreeNodeComponent = TreeNode,
  data,
  onSelect,
  selectedId,
  emptyState = null,
}) {
  const [expandedIds, setExpandedIds] = useState(new Set());

  const handleToggleExpand = useCallback(
    itemId => {
      if (expandedIds.has(itemId)) {
        setExpandedIds(prev => new Set([...prev].filter(id => id !== itemId)));
      } else {
        setExpandedIds(prev => new Set([...prev, itemId]));
      }
    },
    [expandedIds],
  );

  const handleSelect = useCallback(
    itemId => {
      onSelect(itemId);
    },
    [onSelect],
  );

  if (data.length === 0) {
    return <React.Fragment>{emptyState}</React.Fragment>;
  }

  return (
    <TreeNodeList
      TreeNodeComponent={TreeNodeComponent}
      items={data}
      onSelect={handleSelect}
      onToggleExpand={handleToggleExpand}
      expandedIds={expandedIds}
      selectedId={selectedId}
      depth={0}
    />
  );
}

Tree.propTypes = propTypes;
