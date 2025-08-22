/**
 * Lightweight Chart Component
 * Canvas-based chart for better performance on low-end devices
 * Used as fallback when Recharts is too heavy
 */

import React, { useEffect, useRef, useMemo } from 'react';

interface DataPoint {
  year: number;
  bitcoinValue: number;
  cashValue: number;
  totalValue: number;
}

interface LightweightChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  className?: string;
}

const LightweightChart: React.FC<LightweightChartProps> = ({
  data,
  width = 800,
  height = 400,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculate chart dimensions and scales
  const chartConfig = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }
    
    const padding = { top: 40, right: 40, bottom: 60, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Find data ranges
    const maxValue = Math.max(...data.map(d => d.totalValue));
    const minYear = Math.min(...data.map(d => d.year));
    const maxYear = Math.max(...data.map(d => d.year));
    
    // Create scales
    const xScale = (year: number) => 
      ((year - minYear) / (maxYear - minYear)) * chartWidth + padding.left;
    
    const yScale = (value: number) => 
      height - padding.bottom - (value / maxValue) * chartHeight;
    
    return {
      padding,
      chartWidth,
      chartHeight,
      xScale,
      yScale,
      maxValue,
      minYear,
      maxYear
    };
  }, [data, width, height]);
  
  useEffect(() => {
    if (!canvasRef.current || !chartConfig || !data || data.length === 0) {
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { padding, xScale, yScale, maxValue, minYear, maxYear } = chartConfig;
    
    // Set canvas size for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set styles
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw grid lines
    ctx.beginPath();
    
    // Horizontal grid lines
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (i * (height - padding.top - padding.bottom) / ySteps);
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      
      // Y-axis labels
      const value = maxValue * (1 - i / ySteps);
      ctx.fillStyle = '#6b7280';
      ctx.textAlign = 'right';
      ctx.fillText(
        `$${(value / 1000000).toFixed(1)}M`,
        padding.left - 10,
        y
      );
    }
    
    // Vertical grid lines
    const xSteps = Math.min(data.length - 1, 10);
    for (let i = 0; i <= xSteps; i++) {
      const yearIndex = Math.floor(i * (data.length - 1) / xSteps);
      const year = data[yearIndex].year;
      const x = xScale(year);
      
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      
      // X-axis labels
      ctx.fillStyle = '#6b7280';
      ctx.textAlign = 'center';
      ctx.fillText(
        year.toString(),
        x,
        height - padding.bottom + 20
      );
    }
    
    ctx.stroke();
    
    // Draw data lines
    const drawLine = (
      values: number[],
      color: string,
      label: string,
      dashPattern?: number[]
    ) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      
      if (dashPattern) {
        ctx.setLineDash(dashPattern);
      } else {
        ctx.setLineDash([]);
      }
      
      values.forEach((value, index) => {
        const x = xScale(data[index].year);
        const y = yScale(value);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    };
    
    // Draw Bitcoin value line
    drawLine(
      data.map(d => d.bitcoinValue),
      '#f7931a',
      'Bitcoin Value'
    );
    
    // Draw Cash value line (dashed)
    drawLine(
      data.map(d => d.cashValue),
      '#10b981',
      'Cash Value',
      [5, 5]
    );
    
    // Draw Total value line
    drawLine(
      data.map(d => d.totalValue),
      '#3b82f6',
      'Total Value'
    );
    
    // Draw legend
    const legendItems = [
      { color: '#f7931a', label: 'Bitcoin Value', dash: false },
      { color: '#10b981', label: 'Cash Value', dash: true },
      { color: '#3b82f6', label: 'Total Value', dash: false }
    ];
    
    const legendX = width / 2 - 150;
    const legendY = 20;
    
    legendItems.forEach((item, index) => {
      const x = legendX + index * 100;
      
      // Draw line sample
      ctx.beginPath();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      ctx.setLineDash(item.dash ? [5, 5] : []);
      ctx.moveTo(x, legendY);
      ctx.lineTo(x + 20, legendY);
      ctx.stroke();
      
      // Draw label
      ctx.fillStyle = '#374151';
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.setLineDash([]);
      ctx.fillText(item.label, x + 25, legendY);
    });
    
    // Draw chart title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Vesting Value Over Time', width / 2, height - 10);
    
    // Reset line dash
    ctx.setLineDash([]);
    
  }, [data, chartConfig, width, height]);
  
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }
  
  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        aria-label="Vesting value chart showing Bitcoin, Cash, and Total values over time"
        role="img"
      />
      <noscript>
        <div className="text-center p-4">
          <p>This chart requires JavaScript to display.</p>
          <p>Bitcoin Value, Cash Value, and Total Value data from {chartConfig?.minYear} to {chartConfig?.maxYear}</p>
        </div>
      </noscript>
    </div>
  );
};

export default React.memo(LightweightChart);