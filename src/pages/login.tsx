import React, { useRef, useState } from 'react';
import * as CatAnimation from '@/animations/78625-le-petit-chat-cat-noir.json';
import Lottie, { LottieRef } from 'lottie-react';
import { Formik } from 'formik';

export default function Login() {
  const animationRef: LottieRef = useRef(null);
  const [showCat, setShowCat] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      onSubmit={async (values, { setSubmitting }) => {
        setFailed(false);
        console.log('Submitting form with ', values);
        const response = await window.fetch('/api/login', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(values),
        });
        const data = await response.json();
        console.log("Got data ",data);
        if (!data.success) {
          setFailed(true);
        } else {
          console.log('Logged in successfully');
        }
        setSubmitting(false);
      }}
      validate={(values) => {
        if (values.username && values.password) setShowCat(true);
        else setShowCat(false);
        return {};
      }}
      validateOnChange={true}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        /* and other goodies */
      }) => (
        <div className="login-container">
          <div className="title">Login to BF3</div>
          <form id="loginForm" className="form" onSubmit={handleSubmit}>
            <div className="inputField">
              <input
                type="text"
                name="username"
                disabled={isSubmitting}
                placeholder="Username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            <div className="inputField">
              <input
                type="password"
                disabled={isSubmitting}
                name="password"
                placeholder="Password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {showCat && (
                <button
                  className={`animation ${
                    isSubmitting ? 'bounce-cat bounce-5' : ''
                  }`}
                  type="submit"
                >
                  <Lottie
                    lottieRef={animationRef}
                    animationData={CatAnimation}
                    loop={false}
                    // autoplay={false}
                    style={{
                      width: 150,
                      height: 200,
                    }}
                  />
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </Formik>
  );
}
