import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Rating as MuiRating,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
} from '@mui/material';
import { Close as CloseIcon, Star as StarIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const validationSchema = Yup.object({
  rating: Yup.number()
    .required('Rating is required')
    .min(1, 'Please rate the product')
    .max(5, 'Rating cannot be more than 5'),
  review: Yup.string()
    .max(500, 'Review must be at most 500 characters')
    .nullable(),
});

const RatingForm = ({ open, onClose, productId, orderId, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      rating: 0,
      review: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setIsSubmitting(true);
        await axios.post(
          `/api/ratings`,
          {
            productId,
            orderId,
            rating: values.rating,
            review: values.review || undefined,
          },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );

        enqueueSnackbar('Thank you for your review!', { variant: 'success' });
        onSuccess();
        resetForm();
        onClose();
      } catch (error) {
        console.error('Error submitting rating:', error);
        enqueueSnackbar(
          error.response?.data?.message || 'Failed to submit rating',
          { variant: 'error' }
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Rate this product</Typography>
          <IconButton edge="end" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            <FormControl error={formik.touched.rating && Boolean(formik.errors.rating)}>
              <FormLabel component="legend">Your Rating</FormLabel>
              <Box display="flex" alignItems="center">
                <MuiRating
                  name="rating"
                  value={formik.values.rating}
                  onChange={(event, value) =>
                    formik.setFieldValue('rating', value)
                  }
                  precision={0.5}
                  icon={<StarIcon fontSize="large" />}
                  emptyIcon={<StarIcon fontSize="large" style={{ opacity: 0.55 }} />}
                />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {formik.values.rating ? `${formik.values.rating} stars` : 'Rate this product'}
                </Typography>
              </Box>
              {formik.touched.rating && formik.errors.rating && (
                <FormHelperText>{formik.errors.rating}</FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              name="review"
              label="Your Review (Optional)"
              value={formik.values.review}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.review && Boolean(formik.errors.review)}
              helperText={formik.touched.review && formik.errors.review}
              placeholder="Share your experience with this product..."
              variant="outlined"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RatingForm;
