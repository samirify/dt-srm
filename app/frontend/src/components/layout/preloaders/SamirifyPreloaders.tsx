export const MainFullPreloader = ({ show = true }) => {
  return (
    <>
      <div className={`app_full_main_loader_container${show ? "" : " hide"}`}>
        <div className="main-full-preloader"></div>
      </div>
    </>
  );
};
