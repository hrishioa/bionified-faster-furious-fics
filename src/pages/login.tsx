import React, { useEffect, useRef, useState } from 'react';
import * as CatAnimation from '@/animations/78625-le-petit-chat-cat-noir.json';
import Lottie, { LottieRef } from 'lottie-react';
import { Formik } from 'formik';
import { ALLOWED_COOKIES } from 'utils/types';
import { useRouter } from 'next/router';
import { useAppStoreDispatch } from '@/components/Redux-Store/hooks';
import { login, logout } from '@/components/Redux-Store/UserSlice';

export default function Login() {
  const animationRef: LottieRef = useRef(null);
  const [showCat, setShowCat] = useState(false);
  const [failed, setFailed] = useState(false);
  const [successLoading, setSuccessLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const dispatch = useAppStoreDispatch();

  useEffect(() => {
    function getQueryParams() {
      return Object.fromEntries(
        new URLSearchParams(window.location.search).entries(),
      );
    }

    function deleteCookie(name: string) {
      document.cookie =
        name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    const query = getQueryParams();
    if (query.logout && query.logout === 'true') {
      console.log('Effecting logout...');
      ALLOWED_COOKIES.map((cookie) => deleteCookie(cookie));
      setErrorMessage('Logged out.');
      dispatch(logout());
    }

    if (query.ficnotfound && query.ficnotfound === 'true') {
      setErrorMessage('Fic not found. You may not have access.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      onSubmit={async (values, { setSubmitting }) => {
        setFailed(false);
        const response = await window.fetch('/api/login', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(values),
        });
        const data = await response.json();
        if (data.success && data.cookies && data.cookies.length) {
          (data.cookies as string[]).map(
            (cookie) => (document.cookie = cookie.replace(/HttpOnly/i, '')),
          );

          dispatch(
            login({
              username: data.username,
              authenticity_token: data.userAuthToken,
            }),
          );

          const queryParams = Object.fromEntries(
            new URLSearchParams(window.location.search).entries(),
          );

          console.log('query params are ',queryParams);

          if (queryParams.when_successful) {
            console.log('going to ',queryParams.when_successful);
            setSuccessLoading(true);
            router.push(queryParams.when_successful);
          }
        }
        if (!data.success) {
          setFailed(true);
          values.password = '';
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
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        /* and other goodies */
      }) => (
        <div className={`login-container ${(isSubmitting || successLoading) && 'login-disable' || ''}`}>
          {
            (isSubmitting || successLoading) && <div className='login-loader-background'>
              <div className='loader login-loader'></div>
            </div>
          }
          <div className="title">Login to BF3</div>
          {errorMessage && <div className="subtitle">{errorMessage}</div>}
          <form id="loginForm" className="form" onSubmit={handleSubmit}>
            <div className={`inputField ${failed ? 'error' : ''}`}>
              <input
                autoCorrect="off"
                autoCapitalize="none"
                type="text"
                name="username"
                autoFocus={true}
                disabled={isSubmitting}
                placeholder="Username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            <div className={`inputField ${failed ? 'error' : ''}`}>
              <input
                autoCorrect="off"
                autoCapitalize="none"
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
