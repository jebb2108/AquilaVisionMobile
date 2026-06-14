import React from 'react';

const TrackSegment = React.memo(({ top, height, background, zIndex }) => (
  <div
    className="alpha-track__segment"
    style={{ top, height, background, zIndex }}
  />
));

export default TrackSegment;