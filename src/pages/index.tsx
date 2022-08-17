import React from 'react';

export default function Home() {
  return (
    <>
      <span className="input input--jiro">
        <input
          className="input__field input__field--jiro"
          type="text"
          id="input-10"
        />
        <label className="input__label input__label--jiro" htmlFor="input-10">
          <span className="input__label-content input__label-content--jiro">
            {'Fic Number'}
          </span>
        </label>
      </span>
    </>
  );
}
