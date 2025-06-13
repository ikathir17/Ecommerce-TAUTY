import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  Avatar,
  Rating as MuiRating,
  Pagination,
  Skeleton,
  Paper,
  useTheme,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Star as StarIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const StyledRating = styled(MuiRating)({
  '& .MuiRating-iconFilled': {
    color: '#ffb400',
  },
});

const ITEMS_PER_PAGE = 5; // Define how many ratings per page

const ProductRatings = ({ productId, ratings: allRatings }) => {
  const [page, setPage] = useState(1);
  const theme = useTheme();

  // Calculate total pages based on allRatings length
  const totalPages = Math.ceil(allRatings.length / ITEMS_PER_PAGE);

  // Get ratings for the current page
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRatings = allRatings.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // When ratings change, reset page to 1
  useEffect(() => {
    setPage(1);
  }, [allRatings]);

  if (allRatings.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="textSecondary">
          No reviews yet. Be the first to review this product!
        </Typography>
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Customer Reviews
      </Typography>
      
      {currentRatings.map((rating) => (
        <Paper key={rating._id} elevation={0} sx={{ p: 3, mb: 2, bgcolor: theme.palette.grey[50] }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Box display="flex" alignItems="center">
              <Avatar 
                src={rating.user?.avatar} 
                alt={rating.user?.name}
                sx={{ width: 40, height: 40, mr: 2 }}
              >
                {rating.user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {rating.user?.name || 'Anonymous User'}
                </Typography>
                <Box display="flex" alignItems="center">
                  <StyledRating
                    value={rating.rating}
                    precision={0.5}
                    readOnly
                    size="small"
                    icon={<StarIcon fontSize="inherit" />}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                    {format(new Date(rating.createdAt), 'MMM d, yyyy')}
                  </Typography>
                </Box>
              </Box>
            </Box>
            {rating.verified && (
              <Chip 
                label="Verified Purchase" 
                size="small" 
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          
          {rating.review && (
            <Box mt={2}>
              <Typography variant="body2">{rating.review}</Typography>
            </Box>
          )}
          
          {rating.images && rating.images.length > 0 && (
            <Box display="flex" gap={2} mt={2}>
              {rating.images.map((img, idx) => (
                <Box
                  key={idx}
                  component="img"
                  src={img}
                  alt={`Review ${idx + 1}`}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </Paper>
      ))}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
};

export default ProductRatings;
