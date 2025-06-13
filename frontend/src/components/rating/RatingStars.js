import React from 'react';
import { Box, Rating as MuiRating, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const StyledRating = styled(MuiRating)({
  '& .MuiRating-iconFilled': {
    color: '#ffb400',
  },
  '& .MuiRating-iconHover': {
    color: '#ffb400',
  },
});

const RatingStars = ({ value, readOnly = true, onChange, size = 'medium' }) => {
  return (
    <Box display="flex" alignItems="center">
      <StyledRating
        name="product-rating"
        value={value || 0}
        precision={0.5}
        readOnly={readOnly}
        onChange={(event, newValue) => {
          if (onChange) onChange(newValue);
        }}
        icon={<StarIcon fontSize={size} />}
        emptyIcon={<StarBorderIcon fontSize={size} />}
      />
      {value && (
        <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
          {value.toFixed(1)}
        </Typography>
      )}
    </Box>
  );
};

export default RatingStars;
