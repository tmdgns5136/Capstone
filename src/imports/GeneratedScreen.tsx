import svgPaths from "./svg-4vbpzbb5eh";

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Poppins:Bold',sans-serif] h-[36px] justify-center leading-[0] not-italic relative shrink-0 text-[30px] text-center text-white w-[82.88px]">
        <p className="leading-[36px]">Login</p>
      </div>
    </div>
  );
}

function Heading2Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[24px] relative shrink-0 w-full" data-name="Heading 2:margin">
      <Heading />
    </div>
  );
}

function Input() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border-b-2 border-solid border-white inset-0 pointer-events-none" />
    </div>
  );
}

function Label() {
  return (
    <div className="absolute bottom-[26%] content-stretch flex flex-col items-start left-0 top-[26%]" data-name="Label">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white w-[82.5px]">
        <p className="leading-[24px]">Username</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute bottom-[32%] content-stretch flex flex-col items-start right-0 top-[32%]" data-name="Container">
      <div className="h-[18px] relative shrink-0 w-[15.75px]" data-name="Symbol">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.75 18">
          <path d={svgPaths.p31c50b00} fill="var(--fill-0, white)" id="Symbol" />
        </svg>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col h-[50px] items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Input />
      <Label />
      <Container1 />
    </div>
  );
}

function Input1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border-b-2 border-solid border-white inset-0 pointer-events-none" />
    </div>
  );
}

function Label1() {
  return (
    <div className="absolute bottom-[43.08%] content-stretch flex flex-col items-start left-0 top-[20%]" data-name="Label">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white w-[76.94px]">
        <p className="leading-[24px]">Password</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bottom-[47.69%] content-stretch flex flex-col items-start right-0 top-[24.62%]" data-name="Container">
      <div className="h-[18px] relative shrink-0 w-[15.75px]" data-name="Symbol">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.75 18">
          <path d={svgPaths.p3c67a840} fill="var(--fill-0, white)" id="Symbol" />
        </svg>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col h-[65px] items-start justify-center pb-[15px] relative shrink-0 w-full" data-name="Container">
      <Input1 />
      <Label1 />
      <Container3 />
    </div>
  );
}

function Button() {
  return (
    <div className="h-[45px] relative rounded-[40px] shrink-0 w-full" data-name="Button">
      <div className="content-stretch flex items-center justify-center overflow-clip pb-[11px] pt-[10px] px-[2px] relative rounded-[inherit] size-full">
        <div className="absolute inset-[-86.67%_2px]" data-name="Gradient" style={{ backgroundImage: "linear-gradient(rgb(26, 26, 46) 0%, rgb(0, 212, 255) 33.333%, rgb(26, 26, 46) 66.667%, rgb(0, 212, 255) 100%)" }} />
        <div className="flex flex-col font-['Poppins:Semi_Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white w-[43.44px]">
          <p className="leading-[24px]">Login</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#00d4ff] border-solid inset-0 pointer-events-none rounded-[40px]" />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] h-[42px] justify-center leading-[21px] not-italic relative shrink-0 text-[14px] text-center text-white w-[165.52px]">
        <p className="mb-0">{`Don't have an account?`}</p>
        <p className="font-['Poppins:Semi_Bold',sans-serif] text-[#00d4ff]">Sign Up</p>
      </div>
    </div>
  );
}

function Form() {
  return (
    <div className="content-stretch flex flex-col gap-[25px] items-start pb-[10px] pt-[25px] relative shrink-0 w-full" data-name="Form">
      <Container />
      <Container2 />
      <Button />
      <Container4 />
    </div>
  );
}

function SectionSignInPanel() {
  return (
    <div className="absolute bottom-[2px] content-stretch flex flex-col items-start justify-center left-[0.25%] px-[40px] right-1/2 top-[2px]" data-name="Section - SignInPanel">
      <Heading2Margin />
      <Form />
    </div>
  );
}

function Heading1() {
  return (
    <div className="blur-[0px] h-[93.59px] relative shrink-0 w-full" data-name="Heading 2">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Poppins:Black',sans-serif] h-[94px] justify-center leading-[46.8px] not-italic right-0 text-[36px] text-right text-white top-[45.9px] uppercase w-[187.56px]">
        <p className="mb-0">WELCOME</p>
        <p>BACK!</p>
      </div>
    </div>
  );
}

function SectionSignInWelcome() {
  return (
    <div className="absolute bottom-[2px] content-stretch flex flex-col items-start justify-center left-1/2 pb-[60px] pl-[150px] pr-[40px] right-[0.25%] top-[2px]" data-name="Section - SignInWelcome">
      <Heading1 />
    </div>
  );
}

function Heading2Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[16px] relative shrink-0 w-[278px]" data-name="Heading 2:margin">
      <div className="blur-[5px] h-[36px] opacity-0 shrink-0 w-full" data-name="Heading 2" />
    </div>
  );
}

function Heading2MarginCssTransform() {
  return (
    <div className="relative shrink-0 w-[278px]" data-name="Heading 2:margin:css-transform">
      <div className="content-stretch flex flex-col items-start pl-[333.6px] relative w-full">
        <Heading2Margin1 />
      </div>
    </div>
  );
}

function Input2() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border-b-2 border-solid border-white inset-0 pointer-events-none" />
    </div>
  );
}

function Label2() {
  return (
    <div className="absolute bottom-[26%] content-stretch flex flex-col items-start left-0 top-[26%]" data-name="Label">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white w-[82.5px]">
        <p className="leading-[24px]">Username</p>
      </div>
    </div>
  );
}

function Blur() {
  return (
    <div className="absolute blur-[5px] content-stretch flex flex-col h-[50px] items-start justify-center left-[333.6px] opacity-0 right-[-333.6px] top-[25px]" data-name="Blur">
      <Input2 />
      <Label2 />
    </div>
  );
}

function Input3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border-b-2 border-solid border-white inset-0 pointer-events-none" />
    </div>
  );
}

function Label3() {
  return (
    <div className="absolute bottom-[26%] content-stretch flex flex-col items-start left-0 top-[26%]" data-name="Label">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white w-[43.39px]">
        <p className="leading-[24px]">Email</p>
      </div>
    </div>
  );
}

function Blur1() {
  return (
    <div className="absolute blur-[5px] content-stretch flex flex-col h-[50px] items-start justify-center left-[333.6px] opacity-0 right-[-333.6px] top-[100px]" data-name="Blur">
      <Input3 />
      <Label3 />
    </div>
  );
}

function Input4() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border-b-2 border-solid border-white inset-0 pointer-events-none" />
    </div>
  );
}

function Label4() {
  return (
    <div className="absolute bottom-[26%] content-stretch flex flex-col items-start left-0 top-[26%]" data-name="Label">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white w-[76.94px]">
        <p className="leading-[24px]">Password</p>
      </div>
    </div>
  );
}

function Blur2() {
  return (
    <div className="absolute blur-[5px] content-stretch flex flex-col h-[50px] items-start justify-center left-[333.6px] opacity-0 right-[-333.6px] top-[175px]" data-name="Blur">
      <Input4 />
      <Label4 />
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[45px] relative rounded-[40px] shrink-0 w-full" data-name="Button">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute inset-[-86.67%_2px]" data-name="Gradient" style={{ backgroundImage: "linear-gradient(rgb(26, 26, 46) 0%, rgb(0, 212, 255) 33.333%, rgb(26, 26, 46) 66.667%, rgb(0, 212, 255) 100%)" }} />
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#00d4ff] border-solid inset-0 pointer-events-none rounded-[40px]" />
    </div>
  );
}

function Blur3() {
  return (
    <div className="absolute blur-[5px] content-stretch flex flex-col h-[50px] items-start left-[333.6px] opacity-0 right-[-333.6px] top-[257px]" data-name="Blur">
      <Button1 />
    </div>
  );
}

function Blur4() {
  return <div className="absolute blur-[5px] h-[42px] left-[333.6px] opacity-0 right-[-333.6px] top-[327px]" data-name="Blur" />;
}

function Form1() {
  return (
    <div className="h-[379px] relative shrink-0 w-full" data-name="Form">
      <Blur />
      <Blur1 />
      <Blur2 />
      <Blur3 />
      <Blur4 />
    </div>
  );
}

function SectionSignUpPanel() {
  return (
    <div className="absolute bottom-[2px] content-stretch flex flex-col items-start justify-center left-1/2 px-[60px] right-[0.25%] top-[2px]" data-name="Section - SignUpPanel">
      <Heading2MarginCssTransform />
      <Form1 />
    </div>
  );
}

function SectionSignUpWelcome() {
  return (
    <div className="absolute bottom-[2px] content-stretch flex flex-col items-start justify-center left-[-26.5%] pb-[60px] pr-[402px] right-1/2 top-[2px]" data-name="Section - SignUpWelcome">
      <div className="blur-[5px] h-[46.8px] opacity-0 shrink-0 w-full" data-name="Heading 2" />
    </div>
  );
}

function MainAuthWrapper() {
  return (
    <div className="bg-[#1a1a2e] h-[500px] max-w-[800px] relative shrink-0 w-[800px] z-[2]" data-name="MainAuthWrapper">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute flex h-[1440.887px] items-center justify-center right-[-102.19px] top-[-843.88px] w-[817.426px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
          <div className="flex-none rotate-50 scale-x-131 scale-y-77 skew-x-40">
            <div className="h-[600px] w-[850.003px]" data-name="Background Design Shapes" style={{ backgroundImage: "linear-gradient(52.5463deg, rgb(26, 26, 46) 0%, rgb(0, 212, 255) 100%)" }} />
          </div>
        </div>
        <div className="absolute bg-[#1a1a2e] border-[#00d4ff] border-solid border-t-3 bottom-[-139.6%] left-[252px] top-[99.6%] w-[850px]" data-name="Background+HorizontalBorder" />
        <SectionSignInPanel />
        <SectionSignInWelcome />
        <SectionSignUpPanel />
        <SectionSignUpWelcome />
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#00d4ff] border-solid inset-0 pointer-events-none shadow-[0px_0px_25px_0px_#00d4ff]" />
    </div>
  );
}

function Footer() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Footer">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] h-[21px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white w-[209.95px]">
        <p>
          <span className="leading-[21px]">{`Made with ❤️ by `}</span>
          <span className="font-['Poppins:Semi_Bold',sans-serif] leading-[21px] not-italic text-[#00d4ff]">CodeZenithAI</span>
        </p>
      </div>
    </div>
  );
}

function FooterMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[15px] pt-[45px] px-[15px] relative shrink-0 z-[1]" data-name="Footer:margin">
      <Footer />
    </div>
  );
}

export default function GeneratedScreen() {
  return (
    <div className="bg-[#1a1a2e] content-stretch flex flex-col isolate items-center justify-center px-[20px] py-[221.5px] relative size-full" data-name="Generated Screen">
      <MainAuthWrapper />
      <FooterMargin />
    </div>
  );
}