declare module 'moment-jalaali' {
  import moment from 'moment';
  
  namespace jMoment {
    function jIsLeapYear(year: number): boolean;
    function loadPersian(): void;
  }
  
  function jMoment(
    inp?: moment.MomentInput, 
    format?: moment.MomentFormatSpecification, 
    strict?: boolean
  ): moment.Moment;
  
  function jMoment(
    inp?: moment.MomentInput, 
    format?: moment.MomentFormatSpecification, 
    language?: string, 
    strict?: boolean
  ): moment.Moment;
  
  export = jMoment;
}
