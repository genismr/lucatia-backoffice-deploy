import React from 'react'
import { resetPassword } from '../../../../api/auth/index'
import { alertError, alertSuccess } from '../../../../utils/logger'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { Link, useHistory, useParams } from 'react-router-dom'

const initialValues = {
	password: '',
	confirmpassword: ''
}

function ResetPassword() {
	const userId = useParams().userId
  const history = useHistory()

	const ResetPasswordSchema = Yup.object().shape({
		password: Yup.string()
			.min(3, 'Minimum 3 symbols')
			.max(50, 'Maximum 50 symbols')
			.required(
				'Password is required'
			),
		confirmpassword: Yup.string()
			.required(
				'Confirm Password is required'
			)
			.when('password', {
				is: (val) => (val && val.length > 0),
				then: Yup.string().oneOf(
					[Yup.ref('password')],
					'Password and Confirm Password didn\'t match'
				),
			})
	})

	const formik = useFormik({
		initialValues,
		validationSchema: ResetPasswordSchema,
		onSubmit: (values, { setStatus, setSubmitting }) => {
			resetPassword({ password: values.password, id: userId })
				.then(() => {
					alertSuccess({ customMessage: 'Password changed, please login' })
					history.push('/auth')
				})
				.catch((error) => {
					alertError({ error, customMessage: 'Could not change password' })
				})
				.finally(() => setSubmitting(false))
		},
	})

	const getInputClasses = (fieldname) => {
		if (formik.touched[fieldname] && formik.errors[fieldname])
			return 'is-invalid'

		if (formik.touched[fieldname] && !formik.errors[fieldname])
			return 'is-valid'

		return ''
	}

	return (
		<div>
				<div className="login-form login-forgot" style={{ display: 'block' }}>
					<div className="text-center mb-10 mb-lg-20">
						<h3 className="font-size-h1">Reset Password</h3>
						<div className="text-muted font-weight-bold">
              	Enter new password and confirm password
						</div>
					</div>
					<form
						onSubmit={formik.handleSubmit}
						className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
					>
						{formik.status && (
							<div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
								<div className="alert-text font-weight-bold">
									{formik.status}
								</div>
							</div>
						)}

						{/* start - password */}
						<div className="form-group fv-plugins-icon-container">
							<input
								placeholder="Password"
								type="password"
								className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
									'password'
								)}`}
								name="password"
								{...formik.getFieldProps('password')}
							/>
							{formik.touched.password && formik.errors.password ? (
								<div className="fv-plugins-message-container">
									<div className="fv-help-block">{formik.errors.password}</div>
								</div>
							) : null}
						</div>
						{/* end - password */}

						{/* start - confirmpassword */}
						<div className="form-group fv-plugins-icon-container">
							<input
								placeholder="Confirm Password"
								type="password"
								className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
									'confirmpassword'
								)}`}
								name="confirmpassword"
								{...formik.getFieldProps('confirmpassword')}
							/>
							{formik.touched.confirmpassword && formik.errors.confirmpassword ? (
								<div className="fv-plugins-message-container">
									<div className="fv-help-block">{formik.errors.confirmpassword}</div>
								</div>
							) : null}
						</div>
						{/* end - confirmpassword */}

						<div className="form-group d-flex flex-wrap flex-center">
							<button
								id="kt_login_forgot_submit"
								type="submit"
								className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4"
								disabled={formik.isSubmitting}
							>
                Submit
							</button>
							<Link to="/auth">
								<button
									type="button"
                  style={{ color: '#fff' }}
									id="kt_login_forgot_cancel"
									className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4"
								>
									Cancel
								</button>
							</Link>
						</div>
					</form>
				</div>
		</div>
	)
}

export default ResetPassword
