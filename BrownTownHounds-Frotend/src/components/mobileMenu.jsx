import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Link } from "react-router-dom";

export default function MobileMenu() {

  return (
    <Menu>
      <MenuButton className="menuButton">Menu &#8801;</MenuButton>

      <MenuItems  transition anchor="bottom start" className="listboxOptions">
          <MenuItem className="listboxOption">
            <Link className="listboxInnerButtons" to={'/create-character'}>Create Character</Link>
          </MenuItem>
          <MenuItem className="listboxOption">
            <Link className="listboxInnerButtons" to={'/create-party'}>Create Party</Link>
          </MenuItem>
          <MenuItem className="listboxOption">
            <Link className="listboxInnerButtons" to={'/retired-characters'}>Retired Characters</Link>
          </MenuItem>
      </MenuItems >
    </Menu>
  );
}