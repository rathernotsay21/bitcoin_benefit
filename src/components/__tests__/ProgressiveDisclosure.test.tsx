import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Tooltip, ExpandableSection, TechnicalDetails } from '../ProgressiveDisclosure';

describe('ProgressiveDisclosure Components', () => {
  describe('Tooltip', () => {
    it('shows tooltip content on click', () => {
      render(
        <Tooltip content="This is tooltip content">
          <span>Hover me</span>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('This is tooltip content')).toBeInTheDocument();
    });

    it('hides tooltip when clicked again', () => {
      render(
        <Tooltip content="This is tooltip content">
          <span>Hover me</span>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(screen.getByText('This is tooltip content')).toBeInTheDocument();

      fireEvent.click(button);
      expect(screen.queryByText('This is tooltip content')).not.toBeInTheDocument();
    });
  });

  describe('ExpandableSection', () => {
    it('shows content when expanded', () => {
      render(
        <ExpandableSection title="Test Section">
          <p>Hidden content</p>
        </ExpandableSection>
      );

      const button = screen.getByRole('button', { name: /test section/i });
      fireEvent.click(button);

      expect(screen.getByText('Hidden content')).toBeInTheDocument();
    });

    it('starts collapsed by default', () => {
      render(
        <ExpandableSection title="Test Section">
          <p>Hidden content</p>
        </ExpandableSection>
      );

      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('can start expanded when defaultExpanded is true', () => {
      render(
        <ExpandableSection title="Test Section" defaultExpanded={true}>
          <p>Visible content</p>
        </ExpandableSection>
      );

      expect(screen.getByText('Visible content')).toBeInTheDocument();
    });
  });

  describe('TechnicalDetails', () => {
    it('renders summary text and tooltip', () => {
      render(
        <TechnicalDetails 
          summary="₿0.010" 
          details="This is 0.010 Bitcoin worth about $1,000" 
        />
      );

      expect(screen.getByText('₿0.010')).toBeInTheDocument();
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('This is 0.010 Bitcoin worth about $1,000')).toBeInTheDocument();
    });
  });
});