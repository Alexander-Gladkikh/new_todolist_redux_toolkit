import React from 'react'
import {FormikHelpers, useFormik} from 'formik'
import {useSelector} from 'react-redux'
import {Navigate} from 'react-router-dom'
import {useAppDispatch} from 'common/hooks/useAppDispatch';
import {Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, TextField} from '@mui/material'
import {selectIsLoggedIn} from "features/auth/auth.selector";
import {authThunk} from "features/auth/auth-reducer";
import {LoginParamsType} from "features/auth/auth-api";
import {ResponseType} from "common/types";
import {useActions} from "common/hooks/useActions";

export const Login = () => {

  const {login} = useActions(authThunk)

  const isLoggedIn = useSelector(selectIsLoggedIn);

  const formik = useFormik({
    validate: (values) => {
      const errors: Partial<Omit<LoginParamsType, 'captcha'>> = {}
      if (!values.email) {
        errors.email = 'Email is required'
      } else if (!/^[A-Z0-9._%+-]+@[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address'
      }
      if (!values.password) {
       errors.password = 'Required'
      } else if (values.password.length < 3) {
        errors.password = 'Must be 3 characters or more'
      }

      return errors
    },
    initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    onSubmit: (values, formikHelpers: FormikHelpers<LoginParamsType>) => {
      login(values)
        .unwrap()
        .catch((reason: ResponseType) => {
          const {fieldsErrors} = reason
          if (fieldsErrors) {
            fieldsErrors.forEach((fieldError) => {
              formikHelpers.setFieldError(fieldError.field, fieldError.error)
            })
          }
        })
    },
  })

  if (isLoggedIn) {
    return <Navigate to={"/"}/>
  }


  return <Grid container justifyContent="center">
    <Grid item xs={4}>
      <form onSubmit={formik.handleSubmit}>
        <FormControl>
          <FormLabel>
            <p>
              To log in get registered <a href={'https://social-network.samuraijs.com/'}
                                          target={'_blank'}>here</a>
            </p>
            <p>
              or use common test account credentials:
            </p>
            <p> Email: free@samuraijs.com
            </p>
            <p>
              Password: free
            </p>
          </FormLabel>
          <FormGroup>
            <TextField
              label="Email"
              margin="normal"
              {...formik.getFieldProps("email")}
            />
            {formik.errors.email ? <div>{formik.errors.email}</div> : null}
            <TextField
              type="password"
              label="Password"
              margin="normal"
              {...formik.getFieldProps("password")}
            />
            {formik.errors.password ? <div>{formik.errors.password}</div> : null}
            <FormControlLabel
              label={'Remember me'}
              control={<Checkbox
                {...formik.getFieldProps("rememberMe")}
                checked={formik.values.rememberMe}
              />}
            />
            <Button type={'submit'} variant={'contained'} color={'primary'}>Login</Button>
          </FormGroup>
        </FormControl>
      </form>
    </Grid>
  </Grid>
}
