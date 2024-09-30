import BigUpload from '../BigUpload';
import SimpleUpload from '../SimpleUpload';

export default function (props: any) {
  const { type = 'simple', children, ...others } = props;

  let Comp = SimpleUpload;
  if (others?.webkitdirectory || type === 'big') {
    Comp = BigUpload;
  }

  return <Comp {...others}>{children}</Comp>;
}
