import * as React from "react";

import { IconContext, DefaultContext } from "./iconContext";

export interface IconTree {
  tag: string;
  attr: { [key: string]: string };
  child: IconTree[];
}

function Tree2Element(tree: IconTree[], iconDataOverride: Partial<IconTree>[] = [], userGradient: boolean = false): React.ReactElement[] {
  const res: React.ReactElement[] = [];

  if (tree) {
    const maxLength = Math.max(tree.length, iconDataOverride?.length || 0);

    for (let i = 0; i < maxLength; i++) {
      const node = tree[i];
      const overrideNode = iconDataOverride?.[i];

      if (overrideNode) {
        res.push(
          React.createElement(
            overrideNode.tag || node.tag,
            { key: i, ...node?.attr, ...overrideNode?.attr, ...(userGradient ? { fill: "url(#reactIconsGradient)" } : {}) },
            Tree2Element(node?.child, overrideNode?.child, userGradient)
          )
        );
      } else if (node) {
        res.push(
          React.createElement(
            node.tag,
            { key: i, ...node?.attr, ...(userGradient ? { fill: "url(#reactIconsGradient)" } : {}) },
            Tree2Element(node?.child, [], userGradient)
          )
        );
      }
    }
  }

  return res;
}

export function GenIcon(data: IconTree) {
  return (props: IconBaseProps) => {
    const { iconDataOverride, ...restProps } = props;

    return (
      <IconBase attr={{ ...data.attr }} {...restProps}>
        {Tree2Element(data.child, iconDataOverride, !!props.stops)}
      </IconBase>
    )
  }
}

export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
  children?: React.ReactNode;
  size?: string | number;
  color?: string;
  title?: string;
  iconDataOverride?: Partial<IconTree>[];
  stops?: React.SVGProps<SVGStopElement>[],
  startCoordinates?: StartCoordinates;
}

interface StartCoordinates {
  top?: number,
  right?: number,
  down?: number,
  left?: number,
}

export interface GradientBaseProps {
  stops: React.SVGProps<SVGStopElement>[],
  startCoordinates?: StartCoordinates;
}
function renderGradient({ stops, startCoordinates = {} }: GradientBaseProps): JSX.Element {
  const { top = 0, right = 100, down = 0, left = 0 } = startCoordinates;
  return (
    <linearGradient id="reactIconsGradient" x1={`${left}%`} x2={`${right}%`} y1={`${top}%`} y2={`${down}%`}>
      {stops.map((stopProp, index) => (
        <stop key={index} {...stopProp} />
      ))}
    </linearGradient>
  );
}

export type IconType = (props: IconBaseProps) => React.ReactNode;
export function IconBase(
  props: IconBaseProps & { attr?: Record<string, string> },
): JSX.Element {
  const elem = (conf: IconContext) => {
    const {
      attr,
      size,
      title,
      stops,
      startCoordinates = { top: 0, right: 100, down: 0, left: 0 },
      ...svgProps } = props;
    const computedSize = size || conf.size || "1em";
    let className;
    if (conf.className) className = conf.className;
    if (props.className)
      className = (className ? className + " " : "") + props.className;

    return (
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        {...conf.attr}
        {...attr}
        {...svgProps}
        className={className}
        style={{
          color: props.color || conf.color,
          ...conf.style,
          ...props.style,
        }}
        height={computedSize}
        width={computedSize}
        xmlns="http://www.w3.org/2000/svg"
      >
        {title && <title>{title}</title>}
        {props.children}
        {stops && renderGradient({ stops, startCoordinates })}
      </svg>
    );
  };

  return IconContext !== undefined ? (
    <IconContext.Consumer>
      {(conf: IconContext) => elem(conf)}
    </IconContext.Consumer>
  ) : (
    elem(DefaultContext)
  );
}
