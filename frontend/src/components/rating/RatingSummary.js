import React from 'react';
import { Box, Typography, LinearProgress, Button, Divider, useTheme } from '@mui/material';
import { Star as StarIcon, StarHalf as StarHalfIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const RatingSummary = ({ product, onRateClick }) => {
  const theme = useTheme();
  
  if (!product) return null;

  const { rating = 0, ratingCount = 0, ratings: rawRatings } = product;
  
  // Ensure ratings is an array before processing
  const ratings = Array.isArray(rawRatings) ? rawRatings : [];
  
  // Calculate rating distribution
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => Math.round(r.rating) === star).length,
    percent: (ratings.filter(r => Math.round(r.rating) === star).length / Math.max(1, ratingCount)) * 100
  }));

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <Box textAlign="center" mr={4}>
          <Typography variant="h2" fontWeight={700} lineHeight={1}>
            {parseFloat(rating).toFixed(1)}
          </Typography>
          <Box display="flex" justifyContent="center" my={1}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Box key={star} color={star <= Math.round(rating) ? theme.palette.warning.main : 'grey.400'}>
                {star <= Math.floor(rating) ? (
                  <StarIcon fontSize="small" />
                ) : star - 0.5 <= rating ? (
                  <StarHalfIcon fontSize="small" />
                ) : (
                  <StarBorderIcon fontSize="small" />
                )}
              </Box>
            ))}
          </Box>
          <Typography variant="body2" color="textSecondary">
            Based on {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
          </Typography>
        </Box>

        <Box flex={1}>
          {distribution.map(({ star, count, percent }) => (
            <Box key={star} display="flex" alignItems="center" mb={1}>
              <Typography variant="body2" minWidth={24} textAlign="right" mr={1}>
                {star}
              </Typography>
              <StarIcon fontSize="small" color="warning" />
              <Box flex={1} mx={1}>
                <LinearProgress
                  variant="determinate"
                  value={percent}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor: theme.palette.warning.main,
                    },
                  }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary" minWidth={40}>
                {count}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      
      <Button 
        variant="outlined" 
        color="primary" 
        fullWidth 
        onClick={onRateClick}
        sx={{ mt: 2 }}
      >
        Write a Review
      </Button>
    </Box>
  );
};

export default RatingSummary;
