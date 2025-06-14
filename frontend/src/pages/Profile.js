import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

// Tab panels
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Tab props
function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

// Profile validation schema
const profileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required')
});

// Password validation schema
const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await userService.getProfile();
        setUser(userData);
        // Initialize form with user data
        profileForm.setValues({
          name: userData.name || '',
          email: userData.email || ''
        });
      } catch (err) {
        console.error('Profile load error:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Profile form
  const profileForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || '',
      email: user?.email || ''
    },
    validationSchema: profileSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        await userService.updateProfile(values, authUser.token);
        setSuccess('Profile updated successfully');
      } catch (err) {
        const error = err.response?.data?.msg || 'Failed to update profile';
        setError(error);
        if (err.response?.data?.errors) {
          err.response.data.errors.forEach((e) => {
            setFieldError(e.param, e.msg);
          });
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Password form
  const passwordForm = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setFieldError }) => {
      try {
        const { confirmPassword, ...passwords } = values;
        await userService.changePassword(passwords);
        setSuccess('Password changed successfully');
        resetForm();
      } catch (err) {
        const error = err.response?.data?.msg || 'Failed to change password';
        setError(error);
        if (err.response?.data?.errors) {
          err.response.data.errors.forEach((e) => {
            setFieldError(e.param, e.msg);
          });
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    profileForm.resetForm({
      values: {
        name: user?.name || '',
        email: user?.email || ''
      }
    });
  };

  const handleProfileSubmit = async (values, { setSubmitting }) => {
    try {
      const updatedUser = await userService.updateProfile(values);
      setUser(updatedUser);  // Update the user state with the returned data
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      const error = err.response?.data?.msg || 'Failed to update profile';
      setError(error);
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach((e) => {
          profileForm.setFieldError(e.param, e.msg);
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Failed to load user data. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom fontWeight="bold" textTransform="uppercase">
          Profile
        </Typography>
        {!isEditing && tabValue === 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsEditing(true)}
            startIcon={<EditIcon />}
            size="small"
          >
            Edit Profile
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper elevation={3} sx={{ mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="profile tabs"
            variant="fullWidth"
          >
            <Tab label="Profile Information" {...a11yProps(0)} />
            <Tab label="Change Password" {...a11yProps(1)} />
          </Tabs>
        </Box>

        {/* Profile Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <form onSubmit={profileForm.handleSubmit}>
            {isEditing ? (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Full Name"
                      value={profileForm.values.name}
                      onChange={profileForm.handleChange}
                      onBlur={profileForm.handleBlur}
                      error={profileForm.touched.name && Boolean(profileForm.errors.name)}
                      helperText={profileForm.touched.name && profileForm.errors.name}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email Address"
                      type="email"
                      value={profileForm.values.email}
                      onChange={profileForm.handleChange}
                      onBlur={profileForm.handleBlur}
                      error={profileForm.touched.email && Boolean(profileForm.errors.email)}
                      helperText={profileForm.touched.email && profileForm.errors.email}
                      margin="normal"
                    />
                  </Grid>

                </Grid>
                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsEditing(false);
                      profileForm.resetForm();
                    }}
                    disabled={profileForm.isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={profileForm.isSubmitting || !profileForm.dirty}
                  >
                    {profileForm.isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {user?.name || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {user?.email}
                    </Typography>
                  </Grid>

                </Grid>
              </Box>
            )}
          </form>
        </TabPanel>

        {/* Change Password Tab */}
        <TabPanel value={tabValue} index={1}>
          <form onSubmit={passwordForm.handleSubmit}>
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                fullWidth
                id="currentPassword"
                name="currentPassword"
                label="Current Password"
                type={showPassword.current ? 'text' : 'password'}
                value={passwordForm.values.currentPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                error={
                  passwordForm.touched.currentPassword &&
                  Boolean(passwordForm.errors.currentPassword)
                }
                helperText={
                  passwordForm.touched.currentPassword &&
                  passwordForm.errors.currentPassword
                }
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => toggleShowPassword('current')}
                        edge="end"
                      >
                        {showPassword.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                id="newPassword"
                name="newPassword"
                label="New Password"
                type={showPassword.new ? 'text' : 'password'}
                value={passwordForm.values.newPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                error={
                  passwordForm.touched.newPassword &&
                  Boolean(passwordForm.errors.newPassword)
                }
                helperText={
                  passwordForm.touched.newPassword &&
                  passwordForm.errors.newPassword
                }
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => toggleShowPassword('new')}
                        edge="end"
                      >
                        {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm New Password"
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwordForm.values.confirmPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                error={
                  passwordForm.touched.confirmPassword &&
                  Boolean(passwordForm.errors.confirmPassword)
                }
                helperText={
                  passwordForm.touched.confirmPassword &&
                  passwordForm.errors.confirmPassword
                }
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => toggleShowPassword('confirm')}
                        edge="end"
                      >
                        {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={passwordForm.isSubmitting}
                >
                  {passwordForm.isSubmitting ? 'Updating...' : 'Update Password'}
                </Button>
              </Box>
            </Box>
          </form>
        </TabPanel>
      </Paper>

      {/* Snackbars for success/error messages */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
