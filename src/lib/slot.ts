

export function generateSlotTimes( start: string, 
    end: string, 
    slotDuration: number,
    appointment: { startTime: string; endTime: string}[] ) 
    
    {
        const slots: string[] = [];

        const toMinutes = ( time: string )=> {
            const [ hours, minutes ] = time.split( ':' ).map( Number );
            return hours * 60 + minutes;
        } 

        let current = toMinutes( start );
        const endMinutes = toMinutes( end );

        while( current + slotDuration <= endMinutes ) {
            const slotStart = current;
            const slotEnd = current + slotDuration;

            const overlaps = appointment.some((appt) => {
                const apptStart = toMinutes( appt.startTime );
                const apptEnd = toMinutes( appt.endTime );
                return slotStart < apptEnd && apptStart < slotEnd;
            });

            if( !overlaps ){
                const hours = Math.floor( slotStart / 60 ).toString().padStart( 2, '0' );
                const minutes = ( slotStart % 60 ).toString().padStart( 2, '0' );
                slots.push( `${ hours }:${ minutes }` );
            }  
            current += slotDuration;
        }
        return slots;
    }