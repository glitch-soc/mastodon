import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';

import { DropdownSelector } from 'flavours/glitch/components/dropdown_selector';
import { IconButton } from 'flavours/glitch/components/icon_button';
import { Popover } from 'flavours/glitch/components/popover';

export const DropdownIconButton = ({ value, disabled, icon, onChange, iconComponent, title, options }) => {
  const [activeElement, setActiveElement] = useState(null);
  const [open, setOpen] = useState(false);
  const [containerElement, setContainerElement] = useState(null);

  const handleToggle = useCallback(() => {
    if (open && activeElement) {
      activeElement.focus({ preventScroll: true });
      setActiveElement(null);
    }

    setOpen(!open);
  }, [open, setOpen, activeElement, setActiveElement]);

  const handleClose = useCallback(() => {
    if (open && activeElement) {
      activeElement.focus({ preventScroll: true });
      setActiveElement(null);
    }

    setOpen(false);
  }, [open, setOpen, activeElement, setActiveElement]);

  return (
    <div ref={setContainerElement}>
      <IconButton
        disabled={disabled}
        icon={icon}
        onClick={handleToggle}
        iconComponent={iconComponent}
        title={title}
        active={open}
        size={18}
        inverted
      />

      <Popover
        isOpen={open}
        offset={5}
        reference={containerElement}
        onClose={handleClose}
      >
        {({ props, placement }) => (
          <div {...props}>
            <div className={`dropdown-animation privacy-dropdown__dropdown ${placement}`}>
              <DropdownSelector
                items={options}
                value={value}
                onClose={handleClose}
                onChange={onChange}
              />
            </div>
          </div>
        )}
      </Popover>
    </div>
  );
};

DropdownIconButton.propTypes = {
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  iconComponent: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
};
