import React from 'react';

export default function ObjectContainer(props: any = {}) {
  return props.children && props.children.length > 0 ? (
    <div>{props.children}</div>
  ) : (
    <></>
  );
}
