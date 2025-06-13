import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';

const ProductRatingBadge = ({ rating, ratingCount, size = 'small' }) => {
  if (!rating || rating === 0) return null;

  const fontSize = size === 'small' ? '0.75rem' : '0.875rem';
  const iconSize = size === 'small' ? '14px' : '16px';

  return (
    <Tooltip title={`${rating.toFixed(1)} out of 5 (${ratingCount} ${ratingCount === 1 ? 'review' : 'reviews'})`}>
      <Box 
        display="inline-flex" 
        alignItems="center" 
        bgcolor="rgba(0, 0, 0, 0.7)" 
        color="white"
        px={0.75}
        py={0.25}
        borderRadius={1}
        sx={{ backdropFilter: 'blur(4px)' }}
      >
        <StarIcon sx={{ fontSize: iconSize, color: '#ffb400', mr: 0.25 }} />
        <Typography variant="caption" fontSize={fontSize} fontWeight={600}>
          {rating.toFixed(1)}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default ProductRatingBadge;
