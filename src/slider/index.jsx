import React, { useRef } from 'react';
import {
  angleToPosition,
  positionToAngle,
  valueToAngle,
  angleToValue,
} from './circularGeometry';
import { arcShapedPath } from './svgPaths';
import { isNotTouchEvent, trimAlignValue, pauseEvent } from './utils';

export default function CircularSlider(props) {
  const {
    svgSize,
    handleRadius,
    maxValue,
    minValue,
    angleType,
    startAngle,
    endAngle,
    value,
    onChange,
    disabled,
    stepValue,
    onBeforeChange,
    onAfterChange,
  } = props;
  const svgRef = useRef();
  const handleRef = useRef();

  const alignedValue = trimAlignValue(value, { minValue, stepValue, maxValue });

  const onStart = ([x, y]) => {
    onBeforeChange(alignedValue);
    processSelection(x, y);
  };

  const onEnd = () => {
    removeListeners();
    onAfterChange(alignedValue);
  };

  const onMove = (event, [x, y]) => {
    pauseEvent(event);

    processSelection(x, y);
  };

  const onMouseMove = (event) => {
    if (event.button !== 0) {
      return;
    }

    onMove(event, [event.clientX, event.clientY]);
  };

  const onTouchMove = (event) => {
    if (isNotTouchEvent(event)) {
      return;
    }

    onMove(event, [event.touches[0].clientX, event.touches[0].clientY]);
  };

  const onMouseDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    if (event.target !== handleRef.current) {
      return;
    }

    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener('mousemove', onMouseMove);
      svg.addEventListener('mouseup', onEnd);
    }
    onStart([event.clientX, event.clientY]);
  };

  const onTouchStart = (event) => {
    if (isNotTouchEvent(event)) {
      return;
    }

    if (event.target !== handleRef.current) {
      return;
    }

    pauseEvent(event);

    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener('touchmove', onTouchMove);
      svg.addEventListener('touchend', onEnd);
      document.addEventListener('touchmove', pauseEvent, { passive: false });
    }
    onStart([event.touches[0].clientX, event.touches[0].clientY]);
  };

  const removeListeners = () => {
    const svg = svgRef.current;
    if (svg) {
      svg.removeEventListener('mousemove', onMouseMove);
      svg.removeEventListener('mouseup', onEnd);
      svg.removeEventListener('touchmove', onTouchMove);
      svg.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchmove', pauseEvent, { passive: false });
    }
  };
  const processSelection = (x, y) => {
    const svg = svgRef.current;
    if (!svg) {
      return;
    }
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = x;
    svgPoint.y = y;
    const coordsInSvg = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
    const angle = positionToAngle(coordsInSvg, svgSize, angleType);
    const newValue = angleToValue({
      angle,
      minValue,
      maxValue,
      startAngle,
      endAngle,
    });

    const alignedValue = trimAlignValue(newValue, {
      minValue,
      stepValue,
      maxValue,
    });

    if (!disabled && value !== alignedValue) {
      onChange(alignedValue);
    }
  };

  const trackRadius = svgSize / 2 - 20;

  const handleAngle = valueToAngle({
    value: alignedValue,
    minValue,
    maxValue,
    startAngle,
    endAngle,
  });

  const handlePosition = angleToPosition(
    { degree: handleAngle, ...angleType },
    trackRadius,
    svgSize
  );

  return (
    <svg
      width={svgSize}
      height={svgSize}
      ref={svgRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onClick={(ev) => !disabled && ev.stopPropagation()}
      className="CircularSlider"
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgb(120, 163, 247)' }} />
          <stop offset="100%" style={{ stopColor: 'rgb(18, 92, 244)' }} />
        </linearGradient>
      </defs>
      <path
        d={arcShapedPath({
          startAngle: handleAngle,
          endAngle,
          angleType,
          radius: trackRadius,
          svgSize: svgSize,
          direction: angleType.direction,
        })}
        stroke={
          disabled ? 'rgba(102, 102, 102, 0.15)' : 'rgba(34, 131, 226, 0.15)'
        }
        className="CircularSlider-track"
      />

      <path
        d={arcShapedPath({
          startAngle,
          endAngle: handleAngle,
          angleType,
          radius: trackRadius,
          svgSize: svgSize,
          direction: angleType.direction,
        })}
        stroke={disabled ? 'rgb(143, 146, 154)' : 'url(#gradient)'}
        className="CircularSlider-fill"
      />

      <filter id="handleShadow" x="-50%" y="-50%" width="16" height="16">
        <feOffset result="offOut" in="SourceGraphic" dx="0" dy="0" />
        <feColorMatrix
          result="matrixOut"
          in="offOut"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="5" />
        <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
      </filter>

      <circle
        r={handleRadius}
        cx={handlePosition.x}
        cy={handlePosition.y}
        filter="url(#handleShadow)"
        fill={disabled ? 'rgb(153, 153, 153)' : '#fff'}
        className="CircularSlider-handle"
        ref={handleRef}
      />
    </svg>
  );
}

CircularSlider.defaultProps = {
  svgSize: 200,
  handleRadius: 10,
  minValue: 0,
  maxValue: 100,
  stepValue: 1,
  startAngle: 0,
  endAngle: 360,
  angleType: {
    direction: 'cw',
    axis: '-y',
  },
  onBeforeChange: () => {},
  onAfterChange: () => {},
};
