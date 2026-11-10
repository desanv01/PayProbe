export const theme = {
  background:'#17191E', panel:'#20232B', text:'#F4F0E8', accent:'#E9B44C',
  selected:'#4B3B68', muted:'#B8B3AA', pass:'#8DBF91', fail:'#ED8080',
} as const;
export const scenarioNames:Record<string,string> = {
  S1:'Approval before capture', S2:'Capture and fulfillment',
  S3:'Repeated processing', S4:'Lost capture response',
};
// External strings are always terminal data, never ANSI commands.
export const terminalText=(value:unknown)=>String(value??'unknown').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ');
