import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Link } from "react-router-dom";

export default function BasicMenu({ data = [], title = "Menu", api_root }) {
  const list = Array.isArray(data) ? data : [];

  return (
    <Menu>
      <MenuButton className="menuButton">{title} &#8801;</MenuButton>

      <MenuItems transition anchor="bottom start" className="listboxOptions">
        {list.map((item) => (
          <MenuItem key={item.id} value={item} className="listboxOption">
            <Link className="listboxInnerButtons" to={`${api_root}${item.id}`}>
              {item.name}
            </Link>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
