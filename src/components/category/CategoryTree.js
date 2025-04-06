import React, { useState } from 'react';
import { List, ListItemButton, ListItemText, Collapse, Box } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const CategoryItem = ({ category, level = 0, onSelectCategory }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open);
    }
    onSelectCategory(category.id);
  };

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        sx={{ 
          pl: level * 2 + 2,
          borderLeft: level > 0 ? '1px solid #eee' : 'none',
          ml: level > 0 ? 2 : 0,
          borderRadius: 1
        }}
      >
        <ListItemText primary={category.name} />
        {hasChildren && (open ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>
      
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {category.children.map((child) => (
              <CategoryItem 
                key={child.id} 
                category={child} 
                level={level + 1} 
                onSelectCategory={onSelectCategory}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const CategoryTree = ({ categories, onSelectCategory }) => {
  if (!categories || categories.length === 0) {
    return <Box sx={{ p: 2 }}>No categories available</Box>;
  }

  return (
    <List
      component="nav"
      aria-labelledby="category-tree"
      sx={{ 
        maxHeight: { xs: 300, md: 'calc(100vh - 300px)' }, 
        overflow: 'auto',
        border: '1px solid #eee',
        borderRadius: 1,
      }}
    >
      {categories.map((category) => (
        <CategoryItem 
          key={category.id} 
          category={category} 
          onSelectCategory={onSelectCategory} 
        />
      ))}
    </List>
  );
};

export default CategoryTree;