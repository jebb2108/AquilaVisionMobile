import { useState, useEffect, useRef, useMemo } from 'react';
import TrackSegment from './Bookmarks/TrackSegment';
import TrackUnderlay from './Bookmarks/TrackUnderlay';
import Bookmark from './Bookmarks/Bookmark';
import './AlphaBookmark.scss';

const TYPE_LETTERS = { femto: 'F', frk: 'P', ptk: 'P' };

const FEMTO_DARK = { r: 44, g: 95, b: 138 };
const FEMTO_LIGHT = { r: 166, g: 193, b: 217 };
const P_DARK = { r: 51, g: 51, b: 51 };
const P_LIGHT = { r: 170, g: 170, b: 170 };

const BORDER_RADIUS = 10;

export default function AlphaBookmark({ operations, currentIndex, onJump }) {
  const trackRef = useRef(null);
  const [trackHeight, setTrackHeight] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const dragState = useRef({
    startY: 0,
    startIndex: 0,
    startBlockH: 0,
    lastNotifiedIndex: 0,
    offset: 0,
  });

  const totalOps = operations.length;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const updateHeight = () => setTrackHeight(track.offsetHeight);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const blockHeight = totalOps > 0 ? trackHeight / totalOps : 0;

  // Цветовые блоки
  const blocks = useMemo(() => {
    if (totalOps === 0 || trackHeight === 0) return [];
    return operations.map((op, i) => {
      const t = totalOps > 1 ? i / (totalOps - 1) : 0;
      const isFemto = op.type === 'femto';
      const dark = isFemto ? FEMTO_DARK : P_DARK;
      const light = isFemto ? FEMTO_LIGHT : P_LIGHT;
      const r = Math.round(dark.r + (light.r - dark.r) * t);
      const g = Math.round(dark.g + (light.g - dark.g) * t);
      const b = Math.round(dark.b + (light.b - dark.b) * t);
      return {
        top: i * blockHeight,
        height: blockHeight,
        background: `rgb(${r},${g},${b})`,
        zIndex: 1,
      };
    });
  }, [operations, trackHeight, blockHeight, totalOps]);

  // Подложки
  const underlays = useMemo(() => {
    if (totalOps < 2 || trackHeight === 0) return [];
    const result = [];
    for (let i = 0; i < totalOps - 1; i++) {
      const nextOp = operations[i + 1];
      const isFemto = nextOp.type === 'femto';
      const dark = isFemto ? FEMTO_DARK : P_DARK;
      const light = isFemto ? FEMTO_LIGHT : P_LIGHT;
      const t = (i + 1) / (totalOps - 1);
      const r = Math.round(dark.r + (light.r - dark.r) * t);
      const g = Math.round(dark.g + (light.g - dark.g) * t);
      const b = Math.round(dark.b + (light.b - dark.b) * t);
      result.push({
        top: (i + 1) * blockHeight - BORDER_RADIUS,
        height: BORDER_RADIUS,
        background: `rgb(${r},${g},${b})`,
        zIndex: 0,
      });
    }
    return result;
  }, [operations, trackHeight, blockHeight, totalOps]);

  const currentType = operations[currentIndex]?.type;
  const bookmarkLetter = currentType ? TYPE_LETTERS[currentType] : '';
  const activeColor = currentType === 'femto' ? '#2c5f8a' : '#333333';

  // Позиция закладки с ограничением по границам рельсы
  const clampTop = (value) => {
    if (blockHeight <= 0) return 0;
    return Math.max(0, Math.min(trackHeight - blockHeight, value));
  };

  const visualTop = dragging
    ? clampTop(dragState.current.startIndex * dragState.current.startBlockH + dragOffset)
    : clampTop(currentIndex * blockHeight);

  // Заливка до закладки (не выше трека)
  const fillHeight = Math.max(0, Math.min(trackHeight, visualTop));

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (!trackRef.current || totalOps === 0 || blockHeight === 0) return;

    const startY = e.clientY;
    const startIndex = currentIndex;
    const startBlockH = blockHeight;

    dragState.current = {
      startY,
      startIndex,
      startBlockH,
      lastNotifiedIndex: startIndex,
      offset: 0,
    };

    setDragging(true);
    setDragOffset(0);

    const onMove = (ev) => {
      const dy = ev.clientY - dragState.current.startY;
      dragState.current.offset = dy;
      setDragOffset(dy);

      const indexFloat =
        dragState.current.startIndex +
        dy / dragState.current.startBlockH;
      let newIndex = Math.round(indexFloat);
      newIndex = Math.max(0, Math.min(totalOps - 1, newIndex));

      if (newIndex !== dragState.current.lastNotifiedIndex) {
        onJump(newIndex);
        dragState.current.lastNotifiedIndex = newIndex;
      }
    };

    const onUp = () => {
      const finalIndexFloat =
        dragState.current.startIndex +
        dragState.current.offset / dragState.current.startBlockH;
      let finalIndex = Math.round(finalIndexFloat);
      finalIndex = Math.max(0, Math.min(totalOps - 1, finalIndex));

      if (finalIndex !== dragState.current.lastNotifiedIndex) {
        onJump(finalIndex);
      }

      setDragging(false);
      setDragOffset(0);

      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <div className="alpha-track" ref={trackRef}>
      <div
        className="alpha-track__fill"
        style={{
          height: fillHeight,
          background: activeColor,
        }}
      />
      {underlays.map((ul, i) => (
        <TrackUnderlay
          key={`under-${i}`}
          top={ul.top}
          height={ul.height}
          background={ul.background}
          zIndex={ul.zIndex}
        />
      ))}
      {blocks.map((block, i) => (
        <TrackSegment
          key={`seg-${i}`}
          top={block.top}
          height={block.height}
          background={block.background}
          zIndex={block.zIndex}
        />
      ))}
      {blockHeight > 0 && (
        <Bookmark
          top={visualTop}
          height={blockHeight}
          background={activeColor}
          letter={bookmarkLetter}
          dragging={dragging}
          onPointerDown={handlePointerDown}
        />
      )}
    </div>
  );
}