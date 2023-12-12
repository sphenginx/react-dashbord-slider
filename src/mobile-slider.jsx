import React, { useState } from 'react';
import classnames from 'classnames';
import CircularSlider from './slider/index';
import formatCurrency from './format/currency';

const Slider = () => {
  const [value, setValue] = useState(23);
  const [dragging, setDragging] = useState(false);
  const minValue = 16;
  const maxValue = 30;

  return (
    <div
      className={classnames('MobileSlider', {
        'MobileSlider--dragging': dragging,
      })}
    >
      <div className="MobileSlider-value">
        {formatCurrency(value)}
        <div className="MobileSlider-valueNote">设置温度</div>
      </div>
      <div className="MobileSlider-label min">{formatCurrency(minValue)}</div>
      <div className="MobileSlider-label max">{formatCurrency(maxValue)}</div>
      <CircularSlider
        svgSize={220}
        handleRadius={16}
        value={value}
        onChange={setValue}
        startAngle={50}
        endAngle={310}
        minValue={minValue}
        maxValue={maxValue}
        disabled={value === 24}
        stepValue={1}
        onBeforeChange={() => setDragging(true)}
        onAfterChange={() => setDragging(false)}
      />
    </div>
  );
};

export default Slider;
