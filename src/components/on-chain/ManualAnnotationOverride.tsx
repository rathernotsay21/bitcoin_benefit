'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnnotatedTransaction, ExpectedGrant } from '@/types/on-chain';

interface ManualAnnotationOverrideProps {
  transaction: AnnotatedTransaction;
  availableGrants: ExpectedGrant[];
  onUpdate: (txid: string, grantYear: number | null) => void;
  originalAnnotation?: number | null;
}

export default function ManualAnnotationOverride({
  transaction,
  availableGrants,
  onUpdate,
  originalAnnotation = null
}: ManualAnnotationOverrideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number | null>(transaction.grantYear);
  const [showUndoFeedback, setShowUndoFeedback] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('right');
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isManuallyModified = transaction.isManuallyAnnotated;
  const canUndo = isManuallyModified && originalAnnotation !== transaction.grantYear;

  // Create dropdown options
  const dropdownOptions = [
    { value: null, label: 'Unmatched', status: null },
    ...availableGrants
      .sort((a, b) => a.year - b.year)
      .map(grant => ({
        value: grant.year,
        label: `Year ${grant.year}`,
        status: getGrantYearStatus(grant.year)
      }))
  ];

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isClickOnTrigger = dropdownRef.current?.contains(target);
      const isClickOnDropdown = document.querySelector(`[data-dropdown-id="${transaction.txid}"]`)?.contains(target);

      if (!isClickOnTrigger && !isClickOnDropdown && isOpen) {
        closeDropdown();
      }
    }

    if (isOpen) {
      // Small delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    return undefined;
  }, [isOpen, transaction.txid]);

  // Handle Escape key and window events
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        closeDropdown();
        triggerButtonRef.current?.focus();
      }
    }

    function handleWindowResize() {
      if (isOpen) {
        closeDropdown();
      }
    }

    function handleWindowScroll() {
      if (isOpen) {
        closeDropdown();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey as any);
      window.addEventListener('resize', handleWindowResize);
      window.addEventListener('scroll', handleWindowScroll, true);

      return () => {
        document.removeEventListener('keydown', handleEscapeKey as any);
        window.removeEventListener('resize', handleWindowResize);
        window.removeEventListener('scroll', handleWindowScroll, true);
      };
    }
    return undefined;
  }, [isOpen]);

  // Update local state when transaction changes
  useEffect(() => {
    setSelectedValue(transaction.grantYear);
  }, [transaction.grantYear]);

  function getGrantYearStatus(year: number | null) {
    if (year === null) return null;

    const grant = availableGrants.find(g => g.year === year);
    if (!grant) return null;

    if (grant.isMatched && grant.matchedTxid !== transaction.txid) {
      return 'occupied';
    }
    return 'available';
  }

  function formatGrantYearOption(year: number | null) {
    if (year === null) return 'Unmatched';
    return `Year ${year}`;
  }

  function closeDropdown() {
    setIsOpen(false);
    setFocusedIndex(-1);
  }

  function openDropdown() {
    setIsOpen(true);

    // Calculate dropdown position based on available space
    if (triggerButtonRef.current) {
      requestAnimationFrame(() => {
        if (!triggerButtonRef.current) return;

        const rect = triggerButtonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const dropdownWidth = 224; // w-56 = 14rem = 224px
        const dropdownHeight = 240; // max-h-60 = 15rem = 240px

        // Check if there's enough space on the right
        const spaceOnRight = viewportWidth - rect.right;
        const spaceOnLeft = rect.left;
        const spaceBelow = viewportHeight - rect.bottom;

        // Position dropdown to the right if there's space, otherwise to the left
        let leftPosition = rect.left;
        if (spaceOnRight >= dropdownWidth) {
          setDropdownPosition('right');
          leftPosition = rect.left;
        } else if (spaceOnLeft >= dropdownWidth) {
          setDropdownPosition('left');
          leftPosition = rect.right - dropdownWidth;
        } else {
          // If neither side has enough space, prefer right and let it scroll
          setDropdownPosition('right');
          leftPosition = rect.left;
        }

        // Ensure dropdown doesn't go off-screen horizontally
        const maxLeft = Math.max(8, Math.min(leftPosition, viewportWidth - dropdownWidth - 8));

        // Position vertically - prefer below, but above if no space
        let topPosition = rect.bottom + 4;
        if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
          topPosition = rect.top - dropdownHeight - 4;
        }

        // Set coordinates for fixed positioning
        setDropdownCoords({
          top: topPosition,
          left: maxLeft
        });
      });
    }

    // Focus the currently selected item
    const currentIndex = dropdownOptions.findIndex(opt => opt.value === selectedValue);
    setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
  }

  function moveFocus(direction: 'up' | 'down') {
    if (!isOpen) return;

    const availableIndices = dropdownOptions
      .map((opt, index) => ({ opt, originalIndex: index }))
      .filter(({ opt }) => opt.status !== 'occupied')
      .map(({ originalIndex }) => originalIndex);

    if (availableIndices.length === 0) return;

    let newIndex = focusedIndex;

    if (direction === 'down') {
      const currentPos = availableIndices.indexOf(focusedIndex);
      const nextPos = currentPos + 1 >= availableIndices.length ? 0 : currentPos + 1;
      newIndex = availableIndices[nextPos];
    } else {
      const currentPos = availableIndices.indexOf(focusedIndex);
      const prevPos = currentPos <= 0 ? availableIndices.length - 1 : currentPos - 1;
      newIndex = availableIndices[prevPos];
    }

    setFocusedIndex(newIndex);
    optionRefs.current[newIndex]?.focus();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          moveFocus(event.key === 'ArrowDown' ? 'down' : 'up');
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          openDropdown();
        }
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          closeDropdown();
        }
        break;
    }
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveFocus('down');
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus('up');
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        const option = dropdownOptions[index];
        if (option.status !== 'occupied') {
          handleSelectionChange(option.value);
        }
        break;
      case 'Escape':
        event.preventDefault();
        closeDropdown();
        triggerButtonRef.current?.focus();
        break;
    }
  }

  function handleSelectionChange(newValue: number | null) {
    setSelectedValue(newValue);
    onUpdate(transaction.txid, newValue);
    closeDropdown();

    // Announce the change to screen readers
    const announcement = `Grant year updated to ${formatGrantYearOption(newValue)}`;
    announceToScreenReader(announcement);

    // Show visual feedback briefly
    if (newValue !== transaction.grantYear) {
      setShowUndoFeedback(false);
      setTimeout(() => setShowUndoFeedback(true), 100);
      setTimeout(() => setShowUndoFeedback(false), 2000);
    }
  }

  function handleUndo() {
    const valueToRestore = originalAnnotation;
    setSelectedValue(valueToRestore);
    onUpdate(transaction.txid, valueToRestore);

    // Announce the undo to screen readers
    const announcement = `Reverted to ${valueToRestore === null ? 'automatic annotation' : `Year ${valueToRestore}`}`;
    announceToScreenReader(announcement);

    // Show undo feedback
    setShowUndoFeedback(true);
    setTimeout(() => setShowUndoFeedback(false), 2000);
  }

  function announceToScreenReader(message: string) {
    // Create a live region for screen reader announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;

    document.body.appendChild(liveRegion);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  }

  return (
    <div
      className="relative inline-flex items-center gap-2"
      ref={dropdownRef}
      style={{ zIndex: isOpen ? 10000 : 'auto' }}
    >
      {/* Screen reader only description */}
      <span id={`override-description-${transaction.txid}`} className="sr-only">
        Manual grant year override for transaction {transaction.txid.slice(0, 8)}.
        Current assignment: {formatGrantYearOption(selectedValue)}.
        {isManuallyModified ? ' This has been manually modified.' : ''}
      </span>

      {/* Dropdown trigger button */}
      <div className="relative">
        <button
          ref={triggerButtonRef}
          onClick={() => isOpen ? closeDropdown() : openDropdown()}
          onKeyDown={handleTriggerKeyDown}
          className={`
            inline-flex items-center gap-2 px-3 py-2 rounded-sm text-sm font-medium
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-2
            min-w-[120px] justify-between
            ${isManuallyModified
              ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700'
              : 'bg-gray-50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
            }
            ${isOpen
              ? 'ring-2 ring-bitcoin ring-offset-2 bg-gray-100 dark:bg-slate-700'
              : 'hover:bg-gray-100 dark:hover:bg-slate-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={`override-description-${transaction.txid}`}
          type="button"
        >
          <span className="flex items-center gap-2">
            {formatGrantYearOption(selectedValue)}

            {/* Manual override indicator */}
            {isManuallyModified && (
              <span
                className="inline-flex items-center justify-center w-4 h-4 text-xs bg-blue-500 text-white rounded-full"
                aria-label="Manually modified"
              >
                M
              </span>
            )}
          </span>

          {/* Dropdown arrow with animation */}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>


      </div>

      {/* Undo button */}
      {canUndo && (
        <button
          onClick={handleUndo}
          className={`
            inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-1
            ${showUndoFeedback
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-600 dark:text-gray-400 dark:bg-slate-700 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
            }
          `}
          title="Revert to automatic annotation"
          aria-label={`Revert transaction to ${originalAnnotation === null ? 'unmatched' : `Year ${originalAnnotation}`}`}
          type="button"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span className="sr-only sm:not-sr-only">
            {showUndoFeedback ? 'Reverted' : 'Undo'}
          </span>
        </button>
      )}

      {/* Success feedback animation */}
      {showUndoFeedback && !canUndo && (
        <div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-md text-xs font-medium shadow-sm z-50"
          role="status"
          aria-live="polite"
        >
          Updated!
        </div>
      )}

      {/* Portal dropdown menu - renders at body level to escape all stacking contexts */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          data-dropdown-id={transaction.txid}
          className="fixed z-[99999] w-56 bg-white dark:bg-slate-800 rounded-sm shadow-sm border border-gray-200 dark:border-slate-600 py-1 max-h-60 overflow-y-auto"
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            top: `${dropdownCoords.top}px`,
            left: `${dropdownCoords.left}px`,
            visibility: dropdownCoords.top > 0 ? 'visible' : 'hidden'
          }}
          role="listbox"
          aria-labelledby={`override-description-${transaction.txid}`}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          {dropdownOptions.map((option, index) => {
            const isSelected = option.value === selectedValue;
            const isOccupied = option.status === 'occupied';
            const isFocused = focusedIndex === index;

            return (
              <button
                key={option.value ?? 'unmatched'}
                ref={(el) => { optionRefs.current[index] = el; }}
                onClick={() => !isOccupied && handleSelectionChange(option.value)}
                onKeyDown={(e) => handleOptionKeyDown(e, index)}
                disabled={isOccupied}
                className={`
                  w-full px-4 py-2 text-left text-sm flex items-center justify-between
                  transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-inset
                  ${isSelected
                    ? 'bg-bitcoin/10 text-bitcoin dark:bg-bitcoin/20'
                    : 'text-gray-700 dark:text-gray-300 dark:text-slate-700 dark:text-slate-300'
                  }
                  ${isFocused && !isOccupied && !isSelected
                    ? 'bg-gray-100 dark:bg-slate-700'
                    : ''
                  }
                  ${isOccupied
                    ? 'opacity-50 cursor-not-allowed'
                    : !isSelected ? 'hover:bg-gray-100 dark:hover:bg-slate-700' : ''
                  }
                `}
                role="option"
                aria-selected={isSelected}
                aria-disabled={isOccupied}
                type="button"
              >
                <span className="flex items-center gap-2">
                  {option.label}
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-bitcoin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>

                {/* Status indicators */}
                {isOccupied && (
                  <span className="text-xs text-bitcoin-600 dark:text-orange-400 font-medium">
                    Occupied
                  </span>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}