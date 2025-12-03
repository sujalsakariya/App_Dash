import { useRef } from 'react';
import { toAbsoluteUrl } from '@/utils';
import { Menu, MenuItem, MenuToggle } from '@/components';
import { DropdownUser } from '@/partials/dropdowns/user';
import { useLanguage } from '@/i18n';
const HeaderTopbar = () => {
  const {
    isRTL
  } = useLanguage();
  const itemUserRef = useRef(null);
  return <div className="flex items-center gap-2 lg:gap-3.5">
    <Menu>
      <MenuItem ref={itemUserRef} toggle="dropdown" trigger="click" dropdownProps={{
        placement: isRTL() ? 'bottom-start' : 'bottom-end',
        modifiers: [{
          name: 'offset',
          options: {
            offset: isRTL() ? [-20, 10] : [20, 10] // [skid, distance]
          }
        }]
      }}>
        <MenuToggle className="btn btn-icon rounded-full">
          <img className="size-9 rounded-full border-2 border-success shrink-0" src={toAbsoluteUrl('/media/avatars/300-2.png')} alt="" />
        </MenuToggle>
        {DropdownUser({
          menuItemRef: itemUserRef
        })}
      </MenuItem>
    </Menu>
  </div>;
};
export { HeaderTopbar };