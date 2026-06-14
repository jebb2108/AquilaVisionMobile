// TrackUnderlay.jsx
import React from 'react';

const TrackUnderlay = React.memo(({ top, height, background, zIndex }) => (
  <div
    className="alpha-track__underlay"
    style={{ top, height, background, zIndex }}
  />
));

export default TrackUnderlay;