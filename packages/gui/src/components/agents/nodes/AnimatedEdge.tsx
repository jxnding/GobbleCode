import { memo } from "react";
import { EdgeProps, getBezierPath } from "reactflow";

const SOCKET_COLORS: Record<string, string> = {
  task: "#F59E0B",
  result: "#10B981",
  context: "#8B5CF6",
  error: "#EF4444",
  search: "#3B82F6",
};

const AnimatedEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
  }: EdgeProps) => {
    const [edgePath] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const color = data?.color || "#FFD700";

    return (
      <>
        {/* Glow background */}
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeOpacity={0.1}
          className="react-flow__edge-path"
        />
        {/* Main edge */}
        <path
          id={id}
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeOpacity={0.6}
          className="react-flow__edge-path"
          markerEnd={markerEnd}
        />
        {/* Animated dots */}
        <circle r="4" fill={color} opacity={0.8}>
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
        <circle r="3" fill={color} opacity={0.6}>
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} begin="0.5s" />
        </circle>
        <circle r="2" fill={color} opacity={0.4}>
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} begin="1s" />
        </circle>
      </>
    );
  }
);

AnimatedEdge.displayName = "AnimatedEdge";

export default AnimatedEdge;
