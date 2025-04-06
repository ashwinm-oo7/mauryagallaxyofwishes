import React, { useEffect, useRef, useState } from "react";
import "../css/MobileMenu.css";
import {
  FaGift,
  FaHandHoldingHeart,
  FaHome,
  FaTags,
  FaUser,
  FaUserShield,
} from "react-icons/fa";

const MobileMenu = ({ isAdmin, logout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => setOpen(!open);
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="menu-wrapper">
      <span
        className={open ? "" : "menu-toggle-btn-fixed"}
        onClick={toggleMenu}
      >
        {open ? "" : "☰"}
      </span>

      {open && (
        <>
          {/* Optional backdrop (you can add a background if you like) */}
          <div
            onClick={closeMenu}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 101,
              backgroundColor: "#101010a6",
            }}
          >
            <span
              className={open ? "menu-toggle-btn" : ""}
              onClick={toggleMenu}
            >
              {open ? "X" : ""}
            </span>
          </div>

          <nav
            className={`menu-overlay ${open ? "menu-show" : ""}`}
            ref={menuRef}
            style={{ zIndex: 102 }}
          >
            <ul className="menu-list">
              <li>
                {localStorage.getItem("userEmail") ? (
                  <a
                    href="##"
                    onClick={() => logout()}
                    style={{ backgroundColor: "rgb(255 59 59)" }}
                  >
                    <FaUser /> Logout
                  </a>
                ) : (
                  <a
                    href="/login"
                    style={{ backgroundColor: "rgb(255 59 59)" }}
                  >
                    <FaUser /> Login
                  </a>
                )}
              </li>
              <li>
                <a href="/" style={{ backgroundColor: "#c3c1c1" }}>
                  <FaHome /> Home
                </a>
              </li>

              {isAdmin && (
                <li>
                  <a href="##">
                    <FaUserShield /> Vendor <i className="fa fa-angle-down"></i>
                  </a>
                  <ul className="submenu">
                    <li>
                      <a href="/add-brand">Add Brand</a>
                    </li>
                    <li>
                      <a href="/product-list">Product List</a>
                    </li>
                    <li>
                      <a href="/feedback-list">Feedback List</a>
                    </li>
                    <li>
                      <a href="/payment-info">User Payment Details</a>
                    </li>
                    <li>
                      <a href="/order-list">Order Details</a>
                    </li>
                    <li>
                      <a href="/login-record">Login Record</a>
                    </li>
                  </ul>
                </li>
              )}

              <li>
                <a href="##">
                  Top Category for you <i className="fa fa-angle-down"></i>
                </a>
                <ul className="submenu">
                  <li>
                    <a href="/search-results?query=Tops">Tops</a>
                  </li>
                  <li>
                    <a href="/search-results?query=Bottoms">Bottoms</a>
                  </li>
                  <li>
                    <a href="/search-results?query=Dresses">Dresses</a>
                  </li>
                  <li>
                    <a href="/search-results?query=ActiveWear">ActiveWear</a>
                  </li>
                  <li>
                    <a href="/search-results?query=Outerwear">Outerwear</a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="/#" className="a-tag">
                  <FaGift /> Occasion <i className="fa fa-angle-down"></i>
                </a>
                <ul className="submenu">
                  <li>
                    <a href="/search-results?query=Valentine's Day">
                      Valentine's Day
                    </a>
                  </li>
                  <li>
                    <a href="/search-results?query=Rakhi">Rakhi</a>
                  </li>
                  <li>
                    <a href="/search-results?query=Diwali">Diwali</a>
                  </li>
                  <li>
                    <a href="/search-results?query=BirthDay">Birthday</a>
                  </li>
                  <li>
                    <a href="/search-results?query=FriendShip Day">
                      FriendShip  Day
                    </a>
                  </li>
                  <li>
                    <a href="/search-results?query=Festival">Festival</a>
                  </li>
                  <li>
                    <a href="/search-results?query=Wedding">Wedding</a>
                  </li>
                  <li>
                    <a href="/search-results?query=Mothers Day ">
                      Mother's Day
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="/#">
                  <FaTags /> Shop Brand <i className="fa fa-angle-down"></i>
                </a>
                <ul className="submenu">
                  <li>
                    <ul className="submenu">
                      <li>
                        <a href="/search-results?query=Nike">Nike</a>
                      </li>
                      <li>
                        <a href="/search-results?query=Adidas">Adidas</a>
                      </li>
                      <li>
                        <a href="/search-results?query=Allen Solly">
                          Allen Solly
                        </a>
                      </li>
                      <li>
                        <a href="/search-results?query=H&M">H&M</a>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li>
                <a href="/#">
                  <FaHandHoldingHeart /> HandPic design
                  <i className="fa fa-angle-down"></i>
                </a>
                <ul className="submenu">
                  <li>
                    <a href="/search-results?query=Theme Based Design">
                      Theme Based Design
                    </a>
                  </li>
                  <li>
                    <a href="/search-results?query=DIY & Artistic Gifts">
                      DIY & Artistic Gifts
                    </a>
                  </li>
                  <li>
                    <a href="/search-results?query=Design Your Own">
                      Design Your Own
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="/about">About Us</a>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
};

export default MobileMenu;
