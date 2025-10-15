'use client';

import React from 'react';
import { Image } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableImageProps {
  id: string;
  src: string;
  onDelete: () => void;
  isUploaded?: boolean;
}

export default function SortableImage({ id, src, onDelete, isUploaded = false }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 1,
    boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        width: 200,
        marginRight: 20,
        marginBottom: 20,
        position: "relative",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        transition: "all 0.2s ease",
      }}
      {...attributes}
      {...listeners}
    >
      <Image 
        style={{ 
          width: "100%", 
          height: 200,
          objectFit: "cover",
          display: "block"
        }} 
        src={src} 
        preview={false}
      />
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }} 
        style={{ 
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: "rgba(255, 0, 0, 0.8)", 
          padding: "4px 8px", 
          color: "#fff", 
          borderRadius: "50%", 
          fontWeight: 800,
          cursor: "pointer",
          fontSize: "14px",
          lineHeight: "1",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 0, 0, 1)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        ×
      </div>
      {isDragging && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(24, 144, 255, 0.1)",
            border: "2px dashed #1890ff",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            color: "#1890ff",
            fontWeight: "bold",
          }}
        >
          拖拽中...
        </div>
      )}
    </div>
  );
}
