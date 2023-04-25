import React, { useState } from 'react'
import { useFormik } from 'formik'
// import { connect } from "react-redux";
import * as Yup from 'yup'
import { Link } from 'react-router-dom'
import { /*FormattedMessage,*/ injectIntl } from 'react-intl'
import { useRouter } from '../../../hooks'
import { alertError, alertSuccess, logError } from '../../../../utils'
import { register } from "../../../../api/auth/index"

const initialValues = {
	name: '',
	email: '',
	password: '',
	changepassword: '',
	acceptTerms: false
}

function Registration(props) {
	//console.log('%c[Registration] rendered', '🧠;background: lightpink; color: #444; padding: 3px; border-radius: 5px;')

	const { intl } = props
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const RegistrationSchema = Yup.object().shape({
		name: Yup.string()
			.min(3, 'Minimum 3 symbols')
			.max(50, 'Maximum 50 symbols')
			.required(
				intl.formatMessage({
					id: 'AUTH.VALIDATION.REQUIRED_FIELD',
				})
			),
		email: Yup.string()
			.email('Wrong email format')
			.min(3, 'Minimum 3 symbols')
			.max(50, 'Maximum 50 symbols')
			.required(
				intl.formatMessage({
					id: 'AUTH.VALIDATION.REQUIRED_FIELD',
				})
			),
		password: Yup.string()
			.min(3, 'Minimum 3 symbols')
			.max(50, 'Maximum 50 symbols')
			.required(
				intl.formatMessage({
					id: 'AUTH.VALIDATION.REQUIRED_FIELD',
				})
			),
		changepassword: Yup.string()
			.required(
				intl.formatMessage({
					id: 'AUTH.VALIDATION.REQUIRED_FIELD',
				})
			)
			.when('password', {
				is: (val) => (val && val.length > 0),
				then: Yup.string().oneOf(
					[Yup.ref('password')],
					'Password and Confirm Password didn\'t match'
				),
			}),
		acceptTerms: Yup.bool().required(
			'Mark the confirmation checkbox'
		),
	})

	const enableLoading = () => {
		setLoading(true)
	}

	const disableLoading = () => {
		setLoading(false)
	}

	const getInputClasses = (fieldname) => {
		if (formik.touched[fieldname] && formik.errors[fieldname])
			return 'is-invalid'

		if (formik.touched[fieldname] && !formik.errors[fieldname])
			return 'is-valid'

		return ''
	}

	const formik = useFormik({
		initialValues,
		validationSchema: RegistrationSchema,
		onSubmit: (values, { setStatus, setSubmitting }) => {
			enableLoading()
			setTimeout(async () => {
				try {
					const response = await register({ email: values.email, password: values.password, name: values.name, role: 'admin' })
					disableLoading()
					if (response.status === 201){
						alertSuccess({ customMessage: 'Succesfully registered user' })
						router.push('/auth')
					}
				} catch (error) {
					logError({ error, customMessage:'Error registering user.' })
					alertError({ error, customMessage:'Error registering user.' })
					setStatus('Invalid Register')
				}
				disableLoading()
				setSubmitting(false)
			}, 500)
		},
	})

	return (
		<div className="login-form login-signin" style={{ display: 'block' }}>
			<div className="text-center mb-10 mb-lg-20">
				<h3 className="font-size-h1">
					Sign Up {/*<FormattedMessage id="AUTH.REGISTER.TITLE" />*/}
				</h3>
				<p className="text-muted font-weight-bold">
          			Enter your details to register an account
				</p>
			</div>

			<form
				id="kt_login_signin_form"
				className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
				onSubmit={formik.handleSubmit}
			>
				{/* begin: Alert */}
				{formik.status && (
					<div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
						<div className="alert-text font-weight-bold">{formik.status}</div>
					</div>
				)}
				{/* end: Alert */}

				{/* begin: Name */}
				<div className="form-group fv-plugins-icon-container">
					<input
						placeholder="Full name"
						type="text"
						className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
							'name'
						)}`}
						name="name"
						{...formik.getFieldProps('name')}
					/>
					{formik.touched.name && formik.errors.name ? (
						<div className="fv-plugins-message-container">
							<div className="fv-help-block">{formik.errors.name}</div>
						</div>
					) : null}
				</div>
				{/* end: Name */}

				{/* begin: Email */}
				<div className="form-group fv-plugins-icon-container">
					<input
						placeholder="Email"
						type="email"
						className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
							'email'
						)}`}
						name="email"
						{...formik.getFieldProps('email')}
					/>
					{formik.touched.email && formik.errors.email ? (
						<div className="fv-plugins-message-container">
							<div className="fv-help-block">{formik.errors.email}</div>
						</div>
					) : null}
				</div>
				{/* end: Email */}

				{/* begin: Password */}
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
				{/* end: Password */}

				{/* begin: Confirm Password */}
				<div className="form-group fv-plugins-icon-container">
					<input
						placeholder="Confirm Password"
						type="password"
						className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
							'changepassword'
						)}`}
						name="changepassword"
						{...formik.getFieldProps('changepassword')}
					/>
					{formik.touched.changepassword && formik.errors.changepassword ? (
						<div className="fv-plugins-message-container">
							<div className="fv-help-block">
								{formik.errors.changepassword}
							</div>
						</div>
					) : null}
				</div>
				{/* end: Confirm Password */}

				{/* begin: Terms and Conditions */}
				<div className="form-group">
					<label className="checkbox">
						<input
							type="checkbox"
							name="acceptTerms"
							className="m-1"
							{...formik.getFieldProps('acceptTerms')}
						/>
						<Link
							to="/terms"
							target="_blank"
							className="mr-1"
							rel="noopener noreferrer"
						>
              Accept terms & conditions
						</Link>
						<span />
					</label>
					{formik.touched.acceptTerms && formik.errors.acceptTerms ? (
						<div className="fv-plugins-message-container">
							<div className="fv-help-block">{formik.errors.acceptTerms}</div>
						</div>
					) : null}
				</div>
				{/* end: Terms and Conditions */}
				<div className="form-group d-flex flex-wrap flex-center">
					<button
						type="submit"
						disabled={
							formik.isSubmitting ||
              !formik.isValid ||
              !formik.values.acceptTerms
						}
						className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4"
					>
						<span>Submit</span>
						{loading && <span className="ml-3 spinner spinner-white"/>}
					</button>

					<Link to="/auth/login">
						<button
							type="button"
							className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4"
						>
              Cancel
						</button>
					</Link>
				</div>
			</form>
		</div>
	)
}

export default injectIntl(/* connect(null, auth.actions) */(Registration))
