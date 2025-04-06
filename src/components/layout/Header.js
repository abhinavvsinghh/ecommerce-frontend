import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircle from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { styled, alpha } from "@mui/material/styles";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { searchProducts } from "../../services/productService";
import { getCategoryTreeByGender } from "../../services/categoryService";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "30ch",
    },
  },
}));

const CategoryLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: "none",
  display: "block",
  padding: theme.spacing(0.5, 1),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
  },
}));

const SubcategoryHeading = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(1),
  paddingBottom: theme.spacing(0.5),
}));

const Header = () => {
  const { user, authenticated, logout } = useAuth();
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  // State for search
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);

  // State for user menu
  const [anchorEl, setAnchorEl] = useState(null);

  // State for category menus
  const [menCategories, setMenCategories] = useState([]);
  const [womenCategories, setWomenCategories] = useState([]);
  const [menAnchorEl, setMenAnchorEl] = useState(null);
  const [womenAnchorEl, setWomenAnchorEl] = useState(null);

  // Load category data
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const menData = await getCategoryTreeByGender("men");
        const womenData = await getCategoryTreeByGender("women");
        setMenCategories(menData);
        setWomenCategories(womenData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);
  
  // Safely refresh cart when auth state changes
  useEffect(() => {
    if (authenticated && refreshCart) {
      try {
        refreshCart();
      } catch (err) {
        console.error("Error refreshing cart:", err);
      }
    }
  }, [authenticated, refreshCart]);

  // User menu handlers
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
  };

  // Category menu handlers - Now with click
  const handleMenClick = (event) => {
    if (menAnchorEl) {
      setMenAnchorEl(null); // Close if already open
      // When the menu is already open, clicking should navigate to all men's products
      handleCategoryClick('men');
    } else {
      setMenAnchorEl(event.currentTarget);
      setWomenAnchorEl(null); // Close women menu if open
    }
  };

  const handleWomenClick = (event) => {
    if (womenAnchorEl) {
      setWomenAnchorEl(null); // Close if already open
      // When the menu is already open, clicking should navigate to all women's products
      handleCategoryClick('women');
    } else {
      setWomenAnchorEl(event.currentTarget);
      setMenAnchorEl(null); // Close men menu if open
    }
  };

  const handleCloseMenus = () => {
    setMenAnchorEl(null);
    setWomenAnchorEl(null);
  };

  const handleCategoryClick = (gender) => {
    navigate(`/search?category=${gender}`);
    handleCloseMenus();
  };

  const handleSubcategoryClick = (categoryId) => {
    navigate(`/products/category/${categoryId}`);
    handleCloseMenus();
  };

  // Search handlers
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleClickAway = () => {
    setSearchQuery("");
  };

  // Menu states
  const isMenuOpen = Boolean(anchorEl);
  const isMenMenuOpen = Boolean(menAnchorEl);
  const isWomenMenuOpen = Boolean(womenAnchorEl);

  // Render category menu for Men or Women with better grid layout
  const renderCategoryMenu = (categories, gender) => {
    // Flatten one level to get all subcategories
    const allSubcategories = categories.flatMap((category) =>
      category.children ? category.children : []
    );

    return (
      <Box sx={{ p: 2, width: "650px" }}>
        <Grid container spacing={2}>
          {allSubcategories.map((subcat) => (
            <Grid item xs={4} key={subcat.id}>
              <CategoryLink
                to={`/products/category/${subcat.id}`}
                onClick={() => handleSubcategoryClick(subcat.id)}
                sx={{ textDecoration: "none" }}
              >
                <SubcategoryHeading variant="subtitle2">
                  {subcat.name}
                </SubcategoryHeading>
              </CategoryLink>

              {/* Sub-subcategories */}
              {subcat.children && subcat.children.length > 0 && (
                <Box>
                  {subcat.children.map((childCat) => (
                    <CategoryLink
                      key={childCat.id}
                      to={`/products/category/${childCat.id}`}
                      onClick={() => handleSubcategoryClick(childCat.id)}
                    >
                      <Typography variant="body2">{childCat.name}</Typography>
                    </CategoryLink>
                  ))}
                </Box>
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // User menu
  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem
        onClick={() => {
          handleMenuClose();
          navigate("/profile");
        }}
      >
        Profile
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleMenuClose();
          navigate("/orders");
        }}
      >
        My Orders
      </MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  // Display name logic
  const displayName = user && (user.firstName || user.email || 'User');

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* Logo */}
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "white",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mr: 2,
              }}
            >
              <Box
                sx={{
                  bgcolor: "white",
                  color: "#1976d2",
                  fontWeight: "bold",
                  fontSize: "22px",
                  py: 0.5,
                  px: 1.5,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                <ShoppingCartIcon sx={{ mr: 0.5, fontSize: "1.2em" }} />
                <Box
                  component="span"
                  sx={{
                    background:
                      "linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Am
                </Box>
                <Box component="span" sx={{ color: "#f50057" }}>
                  Cart
                </Box>
              </Box>
            </Box>
          </Link>

          {/* Men & Women Category Buttons */}
          <Box sx={{ ml: 6, display: "flex" }}>
            <Button
              color="inherit"
              endIcon={<KeyboardArrowDownIcon />}
              onClick={handleMenClick}
            >
              Men
            </Button>
            <Menu
              anchorEl={menAnchorEl}
              open={isMenMenuOpen}
              onClose={() => setMenAnchorEl(null)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              PaperProps={{
                style: { maxWidth: "none", width: "auto" },
              }}
            >
              {menCategories.length > 0 ? (
                renderCategoryMenu(menCategories, "men")
              ) : (
                <MenuItem onClick={() => handleCategoryClick("men")}>
                  All Men's Products
                </MenuItem>
              )}
            </Menu>

            <Button
              color="inherit"
              endIcon={<KeyboardArrowDownIcon />}
              onClick={handleWomenClick}
            >
              Women
            </Button>
            <Menu
              anchorEl={womenAnchorEl}
              open={isWomenMenuOpen}
              onClose={() => setWomenAnchorEl(null)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              PaperProps={{
                style: { maxWidth: "none", width: "auto" },
              }}
            >
              {womenCategories.length > 0 ? (
                renderCategoryMenu(womenCategories, "women")
              ) : (
                <MenuItem onClick={() => handleCategoryClick("women")}>
                  All Women's Products
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Search Box */}
          <Box sx={{ flexGrow: 1, px: 2 }}>
            <ClickAwayListener onClickAway={handleClickAway}>
              <Box>
                <Search>
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <form onSubmit={handleSearch}>
                    <StyledInputBase
                      placeholder="Search for Products"
                      inputProps={{ "aria-label": "search" }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      ref={searchInputRef}
                    />
                  </form>
                </Search>
              </Box>
            </ClickAwayListener>
          </Box>

          {/* Cart & User Profile */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Link to="/cart" style={{ textDecoration: "none", color: "white" }}>
              <IconButton size="large" color="inherit">
                <Badge badgeContent={cart?.items?.length || 0} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Link>

            {authenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mr: 1, 
                    fontWeight: 500, 
                    display: { xs: 'none', sm: 'block' } 
                  }}
                >
                  Hi, {displayName}
                </Typography>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              </Box>
            ) : (
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {renderMenu}
    </Box>
  );
};

export default Header;