import React from 'react';
import { Box, Container, Typography, Link as MuiLink, IconButton } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1">
            © {new Date().getFullYear()} Nagarro
          </Typography>
          
          <Box>
            <IconButton
              component={MuiLink}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
            >
              <InstagramIcon />
            </IconButton>
            
            <IconButton
              component={MuiLink}
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
            >
              <TwitterIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;