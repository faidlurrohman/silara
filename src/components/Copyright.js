export default function Copyright() {
  return (
    <div className="text-center text-xs font-light">
      {`Copyright ©`} <a href="#">{` Silara Kab Kota `}</a>
      {new Date().getFullYear()}
    </div>
  );
}
